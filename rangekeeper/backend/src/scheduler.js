/**
 * RangeKeeper Notification Scheduler
 * Graduated urgency system with ASD-friendly pacing
 */

const cron = require('node-cron');
const { getAssignments, logNotification, hasNotificationBeenSent } = require('./database');
const { sendDailySummary, sendReminder, sendUrgentAlert, sendOverdueAlert, isReady } = require('./discord-bot');

// ============================================================================
// NOTIFICATION TIMING LOGIC (ASD-OPTIMIZED)
// ============================================================================

/**
 * Graduated notification schedule:
 * 
 * 7 days before: Gentle FYI (daily summary only)
 * 3 days before: Moderate reminder (Discord embed, low priority)
 * 1 day before: Firm reminder (Discord embed, medium priority)
 * 6 hours before: Strong reminder (Discord embed, high priority)
 * 2 hours before: URGENT (Discord embed + Chrome notification if available)
 * Overdue: Daily nag until submitted (supportive tone, focus on solutions)
 * 
 * Constraints:
 * - No notifications between 10 PM - 8 AM (respect sleep)
 * - Max 1 urgent notification per hour (avoid overwhelm)
 * - No duplicate notifications for same assignment + urgency level
 */

const NOTIFICATION_WINDOWS = {
  REMINDER_3DAY: 72 * 60 * 60 * 1000,  // 3 days
  REMINDER_1DAY: 24 * 60 * 60 * 1000,  // 1 day
  REMINDER_6HOUR: 6 * 60 * 60 * 1000,  // 6 hours
  URGENT_2HOUR: 2 * 60 * 60 * 1000,    // 2 hours
};

const QUIET_HOURS = {
  start: 22, // 10 PM
  end: 8,    // 8 AM
};

let lastUrgentNotification = 0;
const URGENT_COOLDOWN = 60 * 60 * 1000; // 1 hour

// ============================================================================
// NOTIFICATION CHECKER
// ============================================================================

async function checkAndSendNotifications() {
  console.log('[Scheduler] Checking for notifications to send...');
  
  if (!isReady()) {
    console.log('[Scheduler] Discord bot not ready, skipping');
    return;
  }

  // Check if we're in quiet hours
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour >= QUIET_HOURS.start || currentHour < QUIET_HOURS.end) {
    console.log('[Scheduler] In quiet hours, skipping notifications');
    return;
  }

  const nowTimestamp = Date.now();

  // Get all unsubmitted assignments
  const assignments = await getAssignments({ submitted: false });

  for (const assignment of assignments) {
    if (!assignment.due_date) continue;

    const timeUntilDue = assignment.due_date - nowTimestamp;
    const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);

    // Overdue
    if (hoursUntilDue < 0) {
      await handleOverdueAssignment(assignment);
      continue;
    }

    // Urgent (2 hours)
    if (timeUntilDue < NOTIFICATION_WINDOWS.URGENT_2HOUR) {
      await handleUrgentNotification(assignment, nowTimestamp);
      continue;
    }

    // Strong reminder (6 hours)
    if (timeUntilDue < NOTIFICATION_WINDOWS.REMINDER_6HOUR) {
      await handleStrongReminder(assignment);
      continue;
    }

    // Firm reminder (1 day)
    if (timeUntilDue < NOTIFICATION_WINDOWS.REMINDER_1DAY) {
      await handleFirmReminder(assignment);
      continue;
    }

    // Moderate reminder (3 days)
    if (timeUntilDue < NOTIFICATION_WINDOWS.REMINDER_3DAY) {
      await handleModerateReminder(assignment);
      continue;
    }
  }

  console.log('[Scheduler] Notification check complete');
}

// ============================================================================
// NOTIFICATION HANDLERS
// ============================================================================

async function handleModerateReminder(assignment) {
  const notificationType = '3day_reminder';
  
  if (await hasNotificationBeenSent(assignment.id, notificationType)) {
    return; // Already sent
  }

  console.log(`[Scheduler] Sending 3-day reminder for: ${assignment.title}`);
  await sendReminder(assignment);
  await logNotification({
    assignmentId: assignment.id,
    type: notificationType,
    urgency: 'low',
    channel: 'discord',
  });
}

async function handleFirmReminder(assignment) {
  const notificationType = '1day_reminder';
  
  if (await hasNotificationBeenSent(assignment.id, notificationType)) {
    return;
  }

  console.log(`[Scheduler] Sending 1-day reminder for: ${assignment.title}`);
  await sendReminder(assignment);
  await logNotification({
    assignmentId: assignment.id,
    type: notificationType,
    urgency: 'medium',
    channel: 'discord',
  });
}

async function handleStrongReminder(assignment) {
  const notificationType = '6hour_reminder';
  
  if (await hasNotificationBeenSent(assignment.id, notificationType)) {
    return;
  }

  console.log(`[Scheduler] Sending 6-hour reminder for: ${assignment.title}`);
  await sendReminder(assignment);
  await logNotification({
    assignmentId: assignment.id,
    type: notificationType,
    urgency: 'high',
    channel: 'discord',
  });
}

async function handleUrgentNotification(assignment, nowTimestamp) {
  const notificationType = '2hour_urgent';
  
  if (await hasNotificationBeenSent(assignment.id, notificationType)) {
    return;
  }

  // Rate limit urgent notifications (max 1 per hour)
  if (nowTimestamp - lastUrgentNotification < URGENT_COOLDOWN) {
    console.log('[Scheduler] Urgent notification cooldown active, skipping');
    return;
  }

  console.log(`[Scheduler] Sending URGENT alert for: ${assignment.title}`);
  await sendUrgentAlert(assignment);
  await logNotification({
    assignmentId: assignment.id,
    type: notificationType,
    urgency: 'urgent',
    channel: 'discord',
  });

  lastUrgentNotification = nowTimestamp;
}

async function handleOverdueAssignment(assignment) {
  // Send one overdue notification per day (not on the hour it becomes overdue)
  const notificationType = `overdue_${new Date().toISOString().split('T')[0]}`;
  
  if (await hasNotificationBeenSent(assignment.id, notificationType)) {
    return;
  }

  console.log(`[Scheduler] Sending overdue alert for: ${assignment.title}`);
  await sendOverdueAlert(assignment);
  await logNotification({
    assignmentId: assignment.id,
    type: notificationType,
    urgency: 'overdue',
    channel: 'discord',
  });
}

// ============================================================================
// CRON JOBS
// ============================================================================

function startScheduler() {
  console.log('[Scheduler] Starting notification scheduler...');

  // Daily summary at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily summary...');
    try {
      await sendDailySummary();
    } catch (err) {
      console.error('[Scheduler] Daily summary failed:', err);
    }
  });

  // Check for notifications every 15 minutes (during waking hours)
  cron.schedule('*/15 * * * *', async () => {
    try {
      await checkAndSendNotifications();
    } catch (err) {
      console.error('[Scheduler] Notification check failed:', err);
    }
  });

  console.log('[Scheduler] ✅ Scheduler started');
  console.log('[Scheduler] - Daily summary: 8:00 AM');
  console.log('[Scheduler] - Notification checks: Every 15 minutes');
  console.log('[Scheduler] - Quiet hours: 10 PM - 8 AM');
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  startScheduler,
  checkAndSendNotifications, // For manual testing
};
