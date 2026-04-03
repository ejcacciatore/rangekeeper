/**
 * RangeKeeper ICS Feed Poller
 * Periodically fetches and parses Blackboard calendar feeds
 */

const cron = require('node-cron');
const fetch = require('node-fetch');
const ICAL = require('ical.js');
const { upsertAssignment, getICSFeeds, updateICSFeedPoll } = require('./database');

// ============================================================================
// ICS PARSING
// ============================================================================

function parseICSData(icsText) {
  try {
    const jcalData = ICAL.parse(icsText);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent');

    const parsed = [];

    events.forEach(event => {
      try {
        const summary = event.getFirstPropertyValue('summary');
        const description = event.getFirstPropertyValue('description');
        const dtstart = event.getFirstPropertyValue('dtstart');
        const dtend = event.getFirstPropertyValue('dtend');
        const uid = event.getFirstPropertyValue('uid');
        const location = event.getFirstPropertyValue('location');

        // Blackboard typically includes course info in the summary
        // Format: "Course Name: Assignment Title"
        let courseName = null;
        let assignmentTitle = summary;

        if (summary.includes(':')) {
          const parts = summary.split(':');
          courseName = parts[0].trim();
          assignmentTitle = parts.slice(1).join(':').trim();
        }

        // Check if this is an assignment (has due date keyword)
        const isAssignment = summary.toLowerCase().includes('due') ||
                            summary.toLowerCase().includes('assignment') ||
                            description?.toLowerCase().includes('due');

        if (isAssignment) {
          parsed.push({
            id: uid || `ics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: assignmentTitle,
            description: description || null,
            dueDate: dtstart ? dtstart.toJSDate().getTime() : null,
            courseName,
            location,
            source: 'ics',
            scrapedAt: Date.now(),
          });
        }

      } catch (err) {
        console.error('[ICS] Error parsing event:', err);
      }
    });

    return parsed;

  } catch (err) {
    console.error('[ICS] Error parsing ICS data:', err);
    return [];
  }
}

// ============================================================================
// FEED FETCHING
// ============================================================================

async function fetchAndProcessICSFeed(feed) {
  try {
    console.log(`[ICS] Fetching feed: ${feed.name || feed.url}`);

    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'RangeKeeper/1.0',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const icsText = await response.text();
    const events = parseICSData(icsText);

    console.log(`[ICS] Parsed ${events.length} assignment events from feed`);

    // Upsert assignments into database
    for (const event of events) {
      await upsertAssignment({
        id: event.id,
        title: event.title,
        description: event.description,
        dueDate: event.dueDate,
        scrapedAt: event.scrapedAt,
        // Note: We don't have courseId from ICS, so it stays null
        // The extension scraper will fill in courseId when it syncs
      });
    }

    // Update last polled timestamp
    await updateICSFeedPoll(feed.id);

    console.log(`[ICS] Successfully processed feed: ${feed.name || feed.url}`);

  } catch (err) {
    console.error(`[ICS] Error fetching feed ${feed.url}:`, err.message);
  }
}

async function pollAllICSFeeds() {
  console.log('[ICS] Polling all ICS feeds...');

  const feeds = await getICSFeeds();

  if (feeds.length === 0) {
    console.log('[ICS] No ICS feeds configured');
    return;
  }

  for (const feed of feeds) {
    await fetchAndProcessICSFeed(feed);
  }

  console.log('[ICS] Polling complete');
}

// ============================================================================
// CRON JOB
// ============================================================================

function startICSPoller() {
  console.log('[ICS] Starting ICS feed poller...');

  // Poll every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await pollAllICSFeeds();
    } catch (err) {
      console.error('[ICS] Polling error:', err);
    }
  });

  console.log('[ICS] ✅ ICS poller started (every 30 minutes)');

  // Do an immediate poll on startup
  setTimeout(async () => {
    try {
      await pollAllICSFeeds();
    } catch (err) {
      console.error('[ICS] Initial poll error:', err);
    }
  }, 5000); // Wait 5s for everything to initialize
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  startICSPoller,
  pollAllICSFeeds, // For manual testing
  parseICSData,    // For testing
};
