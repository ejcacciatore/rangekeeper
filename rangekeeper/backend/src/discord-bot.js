/**
 * RangeKeeper Discord Bot
 * ASD-friendly notification design with graduated urgency
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { getAssignments } = require('./database');

let client = null;
let isReady = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initDiscordBot() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.log('[Discord] No bot token found, skipping Discord integration');
    return null;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
    ]
  });

  client.on('ready', () => {
    console.log(`[Discord] ✅ Bot logged in as ${client.user.tag}`);
    isReady = true;
  });

  client.on('error', (err) => {
    console.error('[Discord] Client error:', err);
  });

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    return client;
  } catch (err) {
    console.error('[Discord] Failed to login:', err.message);
    return null;
  }
}

// ============================================================================
// MESSAGE HELPERS
// ============================================================================

async function getUser() {
  if (!client || !isReady) {
    throw new Error('Discord bot not ready');
  }

  if (!process.env.DISCORD_USER_ID) {
    throw new Error('DISCORD_USER_ID not set');
  }

  return client.users.fetch(process.env.DISCORD_USER_ID);
}

async function sendDM(content) {
  try {
    const user = await getUser();
    await user.send(content);
    console.log('[Discord] Message sent');
  } catch (err) {
    console.error('[Discord] Failed to send DM:', err.message);
    throw err;
  }
}

// ============================================================================
// EMBED BUILDERS (ASD-FRIENDLY DESIGN)
// ============================================================================

/**
 * Daily summary embed
 * Low urgency, informative tone, clear structure
 */
async function buildDailySummaryEmbed() {
  const now = Date.now();
  const endOfWeek = now + (7 * 24 * 60 * 60 * 1000);

  const assignments = await getAssignments({
    submitted: false,
    dueAfter: now,
    dueBefore: endOfWeek,
  });

  if (assignments.length === 0) {
    return new EmbedBuilder()
      .setColor('#00D9A3') // Calm green
      .setTitle('✨ Good Morning!')
      .setDescription('You have **no assignments** due this week. Great job staying on top of things!')
      .setTimestamp()
      .setFooter({ text: 'RangeKeeper • Daily Summary' });
  }

  // Group by urgency
  const today = assignments.filter(a => {
    const hoursUntil = (a.due_date - now) / (1000 * 60 * 60);
    return hoursUntil < 24;
  });

  const thisWeek = assignments.filter(a => {
    const hoursUntil = (a.due_date - now) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  });

  const embed = new EmbedBuilder()
    .setColor('#667EEA') // Calm purple
    .setTitle('📅 Your Day Ahead')
    .setDescription(`You have **${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}** due this week`)
    .setTimestamp()
    .setFooter({ text: 'RangeKeeper • Daily Summary' });

  if (today.length > 0) {
    embed.addFields({
      name: '⚠️ Due Today',
      value: today.map(a => 
        `• **${a.title}** (${a.course_name})\n  Due: ${formatDueDate(a.due_date)}`
      ).join('\n'),
      inline: false
    });
  }

  if (thisWeek.length > 0) {
    const preview = thisWeek.slice(0, 5);
    embed.addFields({
      name: '📋 This Week',
      value: preview.map(a => 
        `• ${a.title} (${a.course_name}) — ${formatDueDate(a.due_date)}`
      ).join('\n') + (thisWeek.length > 5 ? `\n... and ${thisWeek.length - 5} more` : ''),
      inline: false
    });
  }

  return embed;
}

/**
 * Reminder embed (moderate urgency)
 * Firm but supportive tone
 */
function buildReminderEmbed(assignment, hoursUntilDue) {
  const color = hoursUntilDue < 6 ? '#FFA500' : '#667EEA'; // Orange if <6h, purple otherwise
  
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`📌 Reminder: ${assignment.title}`)
    .setDescription(`This assignment is due **${formatRelativeTime(hoursUntilDue)}**`)
    .addFields(
      { name: 'Course', value: assignment.course_name || 'Unknown', inline: true },
      { name: 'Due', value: formatDueDate(assignment.due_date), inline: true },
      { name: 'Points', value: assignment.points ? `${assignment.points} pts` : 'N/A', inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'RangeKeeper • Reminder' });
}

/**
 * Urgent alert embed
 * High visibility, clear action needed
 */
function buildUrgentEmbed(assignment, hoursUntilDue) {
  const minutesUntilDue = Math.round(hoursUntilDue * 60);
  
  return new EmbedBuilder()
    .setColor('#FF0000') // Red
    .setTitle('🚨 URGENT: Assignment Due Soon!')
    .setDescription(`**${assignment.title}** is due in **${minutesUntilDue} minutes**`)
    .addFields(
      { name: 'Course', value: assignment.course_name || 'Unknown', inline: false },
      { name: 'Due', value: formatDueDate(assignment.due_date), inline: false },
      { name: '⚡ Action Required', value: 'Start working on this assignment NOW if you haven\'t finished it.', inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'RangeKeeper • Urgent Alert' });
}

/**
 * Overdue embed
 * Clear but not judgmental — focus on next steps
 */
function buildOverdueEmbed(assignment, hoursPastDue) {
  return new EmbedBuilder()
    .setColor('#8B0000') // Dark red
    .setTitle('⏰ Overdue Assignment')
    .setDescription(`**${assignment.title}** was due **${formatRelativeTime(hoursPastDue, true)}**`)
    .addFields(
      { name: 'Course', value: assignment.course_name || 'Unknown', inline: false },
      { name: 'Was Due', value: formatDueDate(assignment.due_date), inline: false },
      { name: '💡 Next Steps', value: 'Check if your instructor accepts late submissions. If yes, submit ASAP. If no, reach out to discuss options.', inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'RangeKeeper • Overdue Alert' });
}

// ============================================================================
// NOTIFICATION DISPATCH
// ============================================================================

async function sendDailySummary() {
  try {
    const embed = await buildDailySummaryEmbed();
    await sendDM({ embeds: [embed] });
    console.log('[Discord] Daily summary sent');
  } catch (err) {
    console.error('[Discord] Failed to send daily summary:', err.message);
  }
}

async function sendReminder(assignment) {
  try {
    const now = Date.now();
    const hoursUntilDue = (assignment.due_date - now) / (1000 * 60 * 60);
    
    const embed = buildReminderEmbed(assignment, hoursUntilDue);
    await sendDM({ embeds: [embed] });
    console.log(`[Discord] Reminder sent for assignment: ${assignment.title}`);
  } catch (err) {
    console.error('[Discord] Failed to send reminder:', err.message);
  }
}

async function sendUrgentAlert(assignment) {
  try {
    const now = Date.now();
    const hoursUntilDue = (assignment.due_date - now) / (1000 * 60 * 60);
    
    const embed = buildUrgentEmbed(assignment, hoursUntilDue);
    await sendDM({ embeds: [embed] });
    console.log(`[Discord] Urgent alert sent for assignment: ${assignment.title}`);
  } catch (err) {
    console.error('[Discord] Failed to send urgent alert:', err.message);
  }
}

async function sendOverdueAlert(assignment) {
  try {
    const now = Date.now();
    const hoursPastDue = Math.abs((assignment.due_date - now) / (1000 * 60 * 60));
    
    const embed = buildOverdueEmbed(assignment, hoursPastDue);
    await sendDM({ embeds: [embed] });
    console.log(`[Discord] Overdue alert sent for assignment: ${assignment.title}`);
  } catch (err) {
    console.error('[Discord] Failed to send overdue alert:', err.message);
  }
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function formatDueDate(timestamp) {
  const date = new Date(timestamp);
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  };
  return date.toLocaleString('en-US', options);
}

function formatRelativeTime(hours, past = false) {
  const absHours = Math.abs(hours);
  
  if (absHours < 1) {
    const minutes = Math.round(absHours * 60);
    return past ? `${minutes} minutes ago` : `${minutes} minutes`;
  }
  
  if (absHours < 24) {
    const roundedHours = Math.round(absHours);
    return past ? `${roundedHours} hour${roundedHours !== 1 ? 's' : ''} ago` : `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.round(absHours / 24);
  return past ? `${days} day${days !== 1 ? 's' : ''} ago` : `in ${days} day${days !== 1 ? 's' : ''}`;
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  initDiscordBot,
  sendDailySummary,
  sendReminder,
  sendUrgentAlert,
  sendOverdueAlert,
  isReady: () => isReady,
};
