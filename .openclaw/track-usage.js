#!/usr/bin/env node
/**
 * Usage Tracker for OpenClaw Sessions
 * Logs token usage, costs, and model trends
 */

const fs = require('fs');
const path = require('path');

const MONITOR_FILE = path.join(__dirname, 'usage-monitor.json');

function loadMonitor() {
  if (!fs.existsSync(MONITOR_FILE)) {
    return {
      schema_version: '1.0',
      sessions: [],
      daily_totals: {},
      model_pricing: {},
      last_updated: 0
    };
  }
  return JSON.parse(fs.readFileSync(MONITOR_FILE, 'utf8'));
}

function saveMonitor(data) {
  data.last_updated = Date.now();
  fs.writeFileSync(MONITOR_FILE, JSON.stringify(data, null, 2));
}

function logSession(sessionData) {
  const monitor = loadMonitor();
  
  // Add session
  monitor.sessions.push({
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
    model: sessionData.model,
    tokens_used: sessionData.tokens_used,
    tokens_remaining: sessionData.tokens_remaining,
    cost: sessionData.cost,
    task: sessionData.task || 'General',
    duration_seconds: sessionData.duration_seconds || 0
  });
  
  // Update daily totals
  const today = new Date().toISOString().split('T')[0];
  if (!monitor.daily_totals[today]) {
    monitor.daily_totals[today] = {
      total_tokens: 0,
      total_cost: 0,
      sessions: 0,
      models_used: {}
    };
  }
  
  monitor.daily_totals[today].total_tokens += sessionData.tokens_used;
  monitor.daily_totals[today].total_cost += sessionData.cost;
  monitor.daily_totals[today].sessions += 1;
  
  if (!monitor.daily_totals[today].models_used[sessionData.model]) {
    monitor.daily_totals[today].models_used[sessionData.model] = 0;
  }
  monitor.daily_totals[today].models_used[sessionData.model] += 1;
  
  saveMonitor(monitor);
  return monitor;
}

function calculateCost(model, tokens_used, model_pricing) {
  if (!model_pricing[model]) return 0;
  
  // Estimate 80% input, 20% output (conservative)
  const input_tokens = Math.floor(tokens_used * 0.8);
  const output_tokens = Math.floor(tokens_used * 0.2);
  
  const input_cost = (input_tokens / 1_000_000) * model_pricing[model].input;
  const output_cost = (output_tokens / 1_000_000) * model_pricing[model].output;
  
  return input_cost + output_cost;
}

function generateReport() {
  const monitor = loadMonitor();
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║           OPENCLAW USAGE MONITOR                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  // Last 7 days
  const today = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }
  
  console.log('📊 LAST 7 DAYS\n');
  console.log('Date       | Sessions | Tokens   | Cost     | Top Model');
  console.log('-----------|----------|----------|----------|------------------');
  
  let weekTotal = { tokens: 0, cost: 0, sessions: 0 };
  
  last7Days.forEach(date => {
    const day = monitor.daily_totals[date];
    if (!day) {
      console.log(`${date} |    0     |    0     | $0.00    | —`);
      return;
    }
    
    const topModel = Object.entries(day.models_used)
      .sort((a, b) => b[1] - a[1])[0];
    
    const modelName = topModel ? (monitor.model_pricing[topModel[0]]?.name || topModel[0].split('/').pop()) : '—';
    
    weekTotal.tokens += day.total_tokens;
    weekTotal.cost += day.total_cost;
    weekTotal.sessions += day.sessions;
    
    console.log(
      `${date} | ${String(day.sessions).padStart(8)} | ` +
      `${String(day.total_tokens).padStart(8)} | ` +
      `$${day.total_cost.toFixed(2).padStart(7)} | ${modelName}`
    );
  });
  
  console.log('-----------|----------|----------|----------|------------------');
  console.log(
    `TOTAL      | ${String(weekTotal.sessions).padStart(8)} | ` +
    `${String(weekTotal.tokens).padStart(8)} | ` +
    `$${weekTotal.cost.toFixed(2).padStart(7)} |`
  );
  
  // Model breakdown
  console.log('\n\n📈 MODEL USAGE (ALL TIME)\n');
  
  const modelStats = {};
  monitor.sessions.forEach(s => {
    if (!modelStats[s.model]) {
      modelStats[s.model] = { sessions: 0, tokens: 0, cost: 0 };
    }
    modelStats[s.model].sessions += 1;
    modelStats[s.model].tokens += s.tokens_used;
    modelStats[s.model].cost += s.cost;
  });
  
  console.log('Model                    | Sessions | Tokens   | Total Cost');
  console.log('-------------------------|----------|----------|------------');
  
  Object.entries(modelStats)
    .sort((a, b) => b[1].cost - a[1].cost)
    .forEach(([model, stats]) => {
      const name = monitor.model_pricing[model]?.name || model.split('/').pop();
      console.log(
        `${name.padEnd(24)} | ${String(stats.sessions).padStart(8)} | ` +
        `${String(stats.tokens).padStart(8)} | $${stats.cost.toFixed(2).padStart(9)}`
      );
    });
  
  // Cost projections
  console.log('\n\n💰 COST PROJECTIONS\n');
  
  const avgDailyCost = weekTotal.cost / 7;
  
  console.log(`Average daily cost (7-day):  $${avgDailyCost.toFixed(2)}`);
  console.log(`Projected monthly cost:      $${(avgDailyCost * 30).toFixed(2)}`);
  console.log(`Projected yearly cost:       $${(avgDailyCost * 365).toFixed(2)}`);
  
  // Efficiency score
  console.log('\n\n⚡ EFFICIENCY METRICS\n');
  
  const avgTokensPerSession = weekTotal.tokens / weekTotal.sessions || 0;
  const avgCostPerSession = weekTotal.cost / weekTotal.sessions || 0;
  
  console.log(`Avg tokens per session:      ${avgTokensPerSession.toFixed(0)}`);
  console.log(`Avg cost per session:        $${avgCostPerSession.toFixed(4)}`);
  
  let efficiency = 'Excellent';
  if (avgDailyCost > 15) efficiency = 'High';
  if (avgDailyCost > 25) efficiency = 'Review Recommended';
  
  console.log(`Efficiency rating:           ${efficiency}`);
  
  if (avgDailyCost > 25) {
    console.log('\n⚠️  Daily cost exceeds $25 target. Consider:');
    console.log('   • Using cheaper models for bulk tasks (DeepSeek, Gemini Flash)');
    console.log('   • Reducing Opus usage (use only for complex reasoning)');
    console.log('   • Breaking large tasks into smaller chunks');
  }
  
  console.log('\n');
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'log') {
    // Usage: node track-usage.js log <model> <tokens> <task>
    const model = args[1] || 'anthropic/claude-sonnet-4-5';
    const tokens = parseInt(args[2]) || 0;
    const task = args[3] || 'General';
    
    const monitor = loadMonitor();
    const cost = calculateCost(model, tokens, monitor.model_pricing);
    
    logSession({
      model,
      tokens_used: tokens,
      tokens_remaining: 200000 - tokens,
      cost,
      task
    });
    
    console.log(`✅ Logged session: ${tokens} tokens, $${cost.toFixed(4)} (${task})`);
  } else if (command === 'report') {
    generateReport();
  } else {
    console.log('Usage:');
    console.log('  node track-usage.js log <model> <tokens> [task]');
    console.log('  node track-usage.js report');
  }
}

module.exports = { logSession, calculateCost, generateReport, loadMonitor };
