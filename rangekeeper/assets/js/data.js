// RangeKeeper Data Fetcher
// Loads data from latest.json and provides helper functions

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  
  try {
    const response = await fetch('data/latest.json');
    if (!response.ok) throw new Error('Failed to fetch data');
    cachedData = await response.json();
    return cachedData;
  } catch (error) {
    console.error('[RangeKeeper] Failed to load data:', error);
    return { courses: [], assignments: [], grades: [], generated_at: 0 };
  }
}

function getDueToday(assignments) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
  
  return assignments.filter(a => 
    a.due_date >= startOfDay && 
    a.due_date < endOfDay &&
    !a.submitted
  );
}

function getDueThisWeek(assignments) {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  return assignments.filter(a => 
    a.due_date >= now && 
    a.due_date < (now + oneWeek) &&
    !a.submitted
  ).sort((a, b) => a.due_date - b.due_date);
}

function getOverdue(assignments) {
  const now = Date.now();
  return assignments.filter(a => a.due_date < now && !a.submitted);
}

function calculatePriority(assignment) {
  const now = Date.now();
  const hoursUntilDue = (assignment.due_date - now) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0 || hoursUntilDue < 6) return 2; // URGENT
  if (hoursUntilDue < 24 || (assignment.points && assignment.points > 50)) return 1; // HIGH
  return 0; // NORMAL
}

function getPriorityLabel(priority) {
  switch(priority) {
    case 2: return 'URGENT';
    case 1: return 'HIGH';
    default: return 'NORMAL';
  }
}

function getPriorityColor(priority) {
  switch(priority) {
    case 2: return '#dc2626'; // red
    case 1: return '#f59e0b'; // orange
    default: return '#10b981'; // green
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'No due date';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatTimeRemaining(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff < 0) return 'Overdue';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function getCourseName(courseId, courses) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return 'Unknown Course';
  
  // Parse course code (e.g., "202610-REL-100-919" -> "REL-100")
  const match = course.name.match(/\d+-([A-Z]+-\d+)/);
  return match ? match[1] : course.name;
}

function getCourseColor(courseId) {
  // Simple hash to color mapping
  const colors = [
    '#9E1B32', // Alabama Crimson
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899'  // Pink
  ];
  
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Export functions
window.RangeKeeperData = {
  loadData,
  getDueToday,
  getDueThisWeek,
  getOverdue,
  calculatePriority,
  getPriorityLabel,
  getPriorityColor,
  formatDate,
  formatTimeRemaining,
  getCourseName,
  getCourseColor
};
