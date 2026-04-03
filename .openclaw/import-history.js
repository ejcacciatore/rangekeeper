#!/usr/bin/env node

/**
 * Import Historical Usage Data
 * 
 * Parses OpenClaw session JSONL files to extract historical token usage
 * and backfill the usage-monitor.json database.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SESSIONS_DIR = '/home/ubuntu/.openclaw/agents/main/sessions';
const DATA_FILE = path.join(__dirname, 'usage-monitor.json');

// Model pricing (same as track-usage.js)
const MODEL_PRICING = {
  'anthropic/claude-opus-4-6': { input: 15, output: 75, name: 'Opus 4.6' },
  'anthropic/claude-sonnet-4-6': { input: 3, output: 15, name: 'Sonnet 4.6' },
  'anthropic/claude-sonnet-4-5': { input: 3, output: 15, name: 'Sonnet 4.5' },
  'anthropic/claude-haiku-4-5': { input: 0.8, output: 4, name: 'Haiku 4.5' },
  'openrouter/deepseek/deepseek-chat-v3-0324': { input: 0.2, output: 0.2, name: 'DeepSeek V3' },
  'openrouter/google/gemini-2.0-flash-001': { input: 0.1, output: 0.4, name: 'Gemini Flash' },
  'openrouter/google/gemini-2.0-flash-lite-001': { input: 0.075, output: 0.3, name: 'Gemini Flash Lite' },
  'openrouter/meta-llama/llama-3.3-70b-instruct:free': { input: 0, output: 0, name: 'Llama 3.3 (Free)' }
};

async function parseSessionFile(filePath) {
  const sessions = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentSession = null;
  let sessionStart = null;

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      
      // Look for assistant messages with usage data
      if (entry.role === 'assistant' && entry.usage && entry.usage.cost && entry.usage.cost.total > 0) {
        const timestamp = entry.timestamp || entry.at || Date.now();
        const date = new Date(timestamp).toISOString().split('T')[0];
        
        // Try to extract task description from recent context
        let task = 'General';
        if (entry.content && entry.content.length > 0) {
          const preview = entry.content[0].text?.substring(0, 80) || 'General';
          task = preview.replace(/\n/g, ' ').trim();
        }
        
        // Calculate tokens used (input + output, excluding cache)
        const tokensUsed = (entry.usage.input || 0) + (entry.usage.output || 0);
        
        sessions.push({
          timestamp,
          date,
          model: entry.model || 'anthropic/claude-sonnet-4-5',
          tokens_used: tokensUsed,
          tokens_remaining: 200000 - tokensUsed, // Assume 200K context
          cost: entry.usage.cost.total,
          task,
          duration_seconds: 0
        });
      }
    } catch (err) {
      // Skip invalid lines
    }
  }

  return sessions;
}

async function importAllSessions() {
  console.log('🔍 Scanning for session files...\n');
  
  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(SESSIONS_DIR, f));
  
  console.log(`Found ${sessionFiles.length} session files\n`);
  
  let allSessions = [];
  
  for (const file of sessionFiles) {
    const sessions = await parseSessionFile(file);
    if (sessions.length > 0) {
      console.log(`✅ ${path.basename(file)}: ${sessions.length} sessions`);
      allSessions = allSessions.concat(sessions);
    }
  }
  
  console.log(`\n📊 Total sessions extracted: ${allSessions.length}\n`);
  
  // Sort by timestamp
  allSessions.sort((a, b) => a.timestamp - b.timestamp);
  
  // Build daily totals
  const dailyTotals = {};
  
  allSessions.forEach(session => {
    if (!dailyTotals[session.date]) {
      dailyTotals[session.date] = {
        total_tokens: 0,
        total_cost: 0,
        sessions: 0,
        models_used: {}
      };
    }
    
    dailyTotals[session.date].total_tokens += session.tokens_used;
    dailyTotals[session.date].total_cost += session.cost;
    dailyTotals[session.date].sessions += 1;
    
    if (!dailyTotals[session.date].models_used[session.model]) {
      dailyTotals[session.date].models_used[session.model] = 0;
    }
    dailyTotals[session.date].models_used[session.model] += 1;
  });
  
  // Merge with existing data (if any)
  let existingData = {
    schema_version: '1.0',
    sessions: [],
    daily_totals: {},
    model_pricing: MODEL_PRICING,
    last_updated: 0
  };
  
  if (fs.existsSync(DATA_FILE)) {
    console.log('📂 Loading existing usage data...\n');
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  
  // Merge sessions (avoid duplicates by timestamp)
  const existingTimestamps = new Set(existingData.sessions.map(s => s.timestamp));
  const newSessions = allSessions.filter(s => !existingTimestamps.has(s.timestamp));
  
  existingData.sessions = existingData.sessions.concat(newSessions);
  existingData.sessions.sort((a, b) => a.timestamp - b.timestamp);
  
  // Merge daily totals
  Object.keys(dailyTotals).forEach(date => {
    if (!existingData.daily_totals[date]) {
      existingData.daily_totals[date] = dailyTotals[date];
    } else {
      // Recalculate to ensure accuracy
      existingData.daily_totals[date].total_tokens += dailyTotals[date].total_tokens;
      existingData.daily_totals[date].total_cost += dailyTotals[date].total_cost;
      existingData.daily_totals[date].sessions += dailyTotals[date].sessions;
      
      Object.keys(dailyTotals[date].models_used).forEach(model => {
        if (!existingData.daily_totals[date].models_used[model]) {
          existingData.daily_totals[date].models_used[model] = 0;
        }
        existingData.daily_totals[date].models_used[model] += dailyTotals[date].models_used[model];
      });
    }
  });
  
  existingData.last_updated = Date.now();
  
  // Save
  fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));
  
  console.log(`✅ Imported ${newSessions.length} new sessions`);
  console.log(`📊 Total sessions in database: ${existingData.sessions.length}`);
  console.log(`📅 Date range: ${Object.keys(existingData.daily_totals).sort()[0]} → ${Object.keys(existingData.daily_totals).sort().reverse()[0]}\n`);
  
  // Show summary
  const totalCost = Object.values(existingData.daily_totals).reduce((sum, day) => sum + day.total_cost, 0);
  console.log(`💰 Total historical cost: $${totalCost.toFixed(2)}\n`);
  
  console.log('🎉 Import complete! Run `node track-usage.js report` to see updated stats.');
}

importAllSessions().catch(console.error);
