#!/usr/bin/env node

/**
 * Cost Alert System
 * 
 * Checks daily spending and sends alerts when thresholds exceeded.
 * Can be run manually or via cron (daily check).
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'usage-monitor.json');
const THRESHOLDS = {
  daily: 5.00,      // Alert if >$5/day
  weekly: 35.00,    // Alert if >$35/week
  monthly: 150.00   // Alert if >$150/month projection
};

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ No usage data found. Run track-usage.js first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function checkDailyAlert(data) {
  const today = new Date().toISOString().split('T')[0];
  const todayData = data.daily_totals[today];
  
  if (!todayData) {
    console.log('✅ No usage today yet.');
    return { triggered: false };
  }
  
  if (todayData.total_cost > THRESHOLDS.daily) {
    return {
      triggered: true,
      level: 'daily',
      amount: todayData.total_cost,
      threshold: THRESHOLDS.daily,
      message: `⚠️ DAILY ALERT: $${todayData.total_cost.toFixed(2)} spent today (threshold: $${THRESHOLDS.daily})`
    };
  }
  
  return { triggered: false };
}

function checkWeeklyAlert(data) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }
  
  let weekTotal = 0;
  last7Days.forEach(date => {
    const day = data.daily_totals[date];
    if (day) weekTotal += day.total_cost;
  });
  
  if (weekTotal > THRESHOLDS.weekly) {
    return {
      triggered: true,
      level: 'weekly',
      amount: weekTotal,
      threshold: THRESHOLDS.weekly,
      message: `⚠️ WEEKLY ALERT: $${weekTotal.toFixed(2)} spent this week (threshold: $${THRESHOLDS.weekly})`
    };
  }
  
  return { triggered: false };
}

function checkMonthlyAlert(data) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }
  
  let weekTotal = 0;
  last7Days.forEach(date => {
    const day = data.daily_totals[date];
    if (day) weekTotal += day.total_cost;
  });
  
  const avgDailyCost = weekTotal / 7;
  const monthlyProjection = avgDailyCost * 30;
  
  if (monthlyProjection > THRESHOLDS.monthly) {
    return {
      triggered: true,
      level: 'monthly',
      amount: monthlyProjection,
      threshold: THRESHOLDS.monthly,
      message: `⚠️ MONTHLY ALERT: Projected $${monthlyProjection.toFixed(2)}/month (threshold: $${THRESHOLDS.monthly})`
    };
  }
  
  return { triggered: false };
}

function generateRecommendations(alerts, data) {
  if (alerts.length === 0) return [];
  
  const recommendations = [];
  
  // Analyze model usage
  const modelStats = {};
  data.sessions.forEach(s => {
    if (!modelStats[s.model]) {
      modelStats[s.model] = { sessions: 0, tokens: 0, cost: 0 };
    }
    modelStats[s.model].sessions += 1;
    modelStats[s.model].tokens += s.tokens_used;
    modelStats[s.model].cost += s.cost;
  });
  
  // Check if using expensive models too much
  const opusUsage = modelStats['anthropic/claude-opus-4-6'];
  const sonnetUsage = modelStats['anthropic/claude-sonnet-4-5'] || modelStats['anthropic/claude-sonnet-4-6'];
  const haikuUsage = modelStats['anthropic/claude-haiku-4-5'];
  
  if (opusUsage && opusUsage.cost > 5) {
    recommendations.push('💡 Opus 4.6 usage is high. Reserve for truly complex reasoning only.');
  }
  
  if (sonnetUsage && (!haikuUsage || haikuUsage.sessions < sonnetUsage.sessions * 0.5)) {
    recommendations.push('💡 Consider using Haiku 4.5 for file operations and simple tasks (70% cheaper).');
  }
  
  if (!modelStats['openrouter/deepseek/deepseek-chat-v3-0324'] && data.sessions.length > 5) {
    recommendations.push('💡 Try DeepSeek V3 for bulk data processing (95% cheaper than Sonnet).');
  }
  
  // Check session sizes
  const largeSessions = data.sessions.filter(s => s.tokens_used > 100000);
  if (largeSessions.length > 0) {
    recommendations.push(`💡 ${largeSessions.length} sessions used >100K tokens. Consider breaking into smaller chunks.`);
  }
  
  return recommendations;
}

function sendAlert(alert, recommendations) {
  console.log('\n' + '='.repeat(60));
  console.log(alert.message);
  console.log('='.repeat(60));
  
  if (recommendations.length > 0) {
    console.log('\n📋 RECOMMENDATIONS:\n');
    recommendations.forEach(rec => console.log(rec));
  }
  
  console.log('\n📊 View detailed report:');
  console.log('   node track-usage.js report');
  console.log('\n💰 View dashboard:');
  console.log('   open monitor.html\n');
}

function main() {
  const data = loadData();
  
  const dailyAlert = checkDailyAlert(data);
  const weeklyAlert = checkWeeklyAlert(data);
  const monthlyAlert = checkMonthlyAlert(data);
  
  const alerts = [dailyAlert, weeklyAlert, monthlyAlert].filter(a => a.triggered);
  
  if (alerts.length === 0) {
    console.log('✅ All cost thresholds within limits.');
    console.log(`   Daily: $${(data.daily_totals[new Date().toISOString().split('T')[0]]?.total_cost || 0).toFixed(2)} / $${THRESHOLDS.daily}`);
    
    // Calculate weekly
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }
    let weekTotal = 0;
    last7Days.forEach(date => {
      const day = data.daily_totals[date];
      if (day) weekTotal += day.total_cost;
    });
    
    console.log(`   Weekly: $${weekTotal.toFixed(2)} / $${THRESHOLDS.weekly}`);
    
    const avgDailyCost = weekTotal / 7;
    const monthlyProjection = avgDailyCost * 30;
    console.log(`   Monthly (projected): $${monthlyProjection.toFixed(2)} / $${THRESHOLDS.monthly}`);
    
    return;
  }
  
  const recommendations = generateRecommendations(alerts, data);
  
  alerts.forEach(alert => sendAlert(alert, recommendations));
}

if (require.main === module) {
  main();
}

module.exports = { checkDailyAlert, checkWeeklyAlert, checkMonthlyAlert, generateRecommendations };
