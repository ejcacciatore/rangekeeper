/**
 * RangeKeeper Utility Functions
 * Shared helpers for date parsing, formatting, and error handling
 */

// ============================================================================
// DATE PARSING (Multi-format support for Blackboard)
// ============================================================================

/**
 * Parse Blackboard date strings into ISO timestamps
 * Handles multiple formats:
 * - "Due Mar 25 at 11:59 PM"
 * - "March 25, 2026 11:59 PM"
 * - "3/25/2026 11:59 PM"
 * - ISO format: "2026-03-25T23:59:00Z"
 */
function parseDueDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Try ISO format first
    const isoMatch = dateStr.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    if (isoMatch) {
      return new Date(dateStr).toISOString();
    }

    // Blackboard "Due Mar 25 at 11:59 PM" format
    const bbMatch = dateStr.match(/Due\s+(\w+)\s+(\d+)\s+at\s+(\d+):(\d+)\s+(AM|PM)/i);
    if (bbMatch) {
      const [, month, day, hour, minute, meridiem] = bbMatch;
      const year = new Date().getFullYear(); // Assume current year
      
      const monthNum = getMonthNumber(month);
      let hour24 = parseInt(hour);
      if (meridiem.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (meridiem.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;

      const date = new Date(year, monthNum, parseInt(day), hour24, parseInt(minute));
      return date.toISOString();
    }

    // Standard US format: "3/25/2026 11:59 PM"
    const usMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
    if (usMatch) {
      const [, month, day, year, hour, minute, meridiem] = usMatch;
      
      let hour24 = parseInt(hour);
      if (meridiem.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (meridiem.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minute));
      return date.toISOString();
    }

    // Fallback: try native Date parsing
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString();
    }

    // If all else fails, return the original string
    console.warn('[Utils] Could not parse date:', dateStr);
    return dateStr;

  } catch (err) {
    console.error('[Utils] Date parsing error:', err);
    return dateStr;
  }
}

function getMonthNumber(monthName) {
  const months = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };
  
  return months[monthName.toLowerCase()] || 0;
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);
  
  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    // Past
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    // Future
    if (minutes < 60) return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    return `in ${days} day${days !== 1 ? 's' : ''}`;
  }
}

function formatDueDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ============================================================================
// ID GENERATION
// ============================================================================

function generateId(prefix = 'rk') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (err) {
    console.warn('[Utils] Invalid selector:', selector);
    return null;
  }
}

function safeQuerySelectorAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (err) {
    console.warn('[Utils] Invalid selector:', selector);
    return [];
  }
}

// ============================================================================
// DATA VALIDATION
// ============================================================================

function validateAssignment(assignment) {
  if (!assignment.id || !assignment.title) {
    console.warn('[Utils] Invalid assignment (missing id or title):', assignment);
    return false;
  }
  return true;
}

function validateCourse(course) {
  if (!course.id || !course.name) {
    console.warn('[Utils] Invalid course (missing id or name):', course);
    return false;
  }
  return true;
}

// ============================================================================
// EXPORT (for use in content script and popup)
// ============================================================================

// In a browser extension, we can't use module.exports
// Instead, attach to window for global access
if (typeof window !== 'undefined') {
  window.RangeKeeperUtils = {
    parseDueDate,
    formatRelativeTime,
    formatDueDate,
    generateId,
    safeQuerySelector,
    safeQuerySelectorAll,
    validateAssignment,
    validateCourse,
  };
}
