/**
 * Utility functions for date and time formatting
 */

const DEBUG = true;

const debugLog = (module, message, ...args) => {
  if (DEBUG) {
    console.log(`[DateUtils/${module}]`, message, ...args);
  }
};

const errorLog = (module, message, error, input) => {
  console.error(`[DateUtils/${module}] ${message}`, { error, input });
};

/**
 * Parse date from API response, handling both array format and ISO strings
 * @param {*} dateInput - Date input from API (array or string)
 * @returns {Date|null} - Parsed date or null if invalid
 */
export const parseApiDate = (dateInput) => {
  if (!dateInput) {
    debugLog('parseApiDate', 'Null input received');
    return null;
  }
  
  try {
    debugLog('parseApiDate', 'Attempting to parse date:', dateInput);

    // Handle array format from Java LocalDateTime
    if (Array.isArray(dateInput)) {
      debugLog('parseApiDate', 'Parsing array format:', dateInput);
      const result = new Date(
        dateInput[0], // year
        dateInput[1] - 1, // month (0-indexed)
        dateInput[2] || 1, // day
        dateInput[3] || 0, // hour
        dateInput[4] || 0, // minute
        dateInput[5] || 0, // second
        (dateInput[6] || 0) / 1000000 // nanoseconds to milliseconds
      );

      debugLog('parseApiDate', 'Parsed date from array:', result);
      return result;
    }

    // Handle string format
    if (typeof dateInput === 'string') {
      let date = new Date(dateInput);
      
      if (!isNaN(date.getTime())) {
        debugLog('parseApiDate', 'Standard string parsing successful:', date);
        return date;
      }
      
      // Try alternative format parsing
      if (dateInput.includes('T') && dateInput.includes('-')) {
        debugLog('parseApiDate', 'Attempting alternative format parse');
        const parts = dateInput.split('T');
        if (parts.length === 2) {
          const datePart = parts[0].split('-');
          if (datePart.length === 3) {
            const isoDate = `${datePart[2]}-${datePart[1]}-${datePart[0]}T${parts[1]}`;
            date = new Date(isoDate);
            if (!isNaN(date.getTime())) {
              debugLog('parseApiDate', 'Alternative parsing successful:', date);
              return date;
            }
          }
        }
      }
    }
    
    // Handle Unix timestamp (number) - could be in seconds or milliseconds
    if (typeof dateInput === 'number') {
      debugLog('parseApiDate', 'Parsing numeric timestamp:', dateInput);
      
      // Check if it looks like seconds (less than year 2000 timestamp in milliseconds)
      // Unix timestamp for 2000-01-01 is 946684800, so in milliseconds it's 946684800000
      const isSeconds = dateInput < 946684800000;
      const timestamp = isSeconds ? dateInput * 1000 : dateInput;
      
      debugLog('parseApiDate', `Treating as ${isSeconds ? 'seconds' : 'milliseconds'}, converted to:`, timestamp);
      
      const date = new Date(timestamp);
      
      if (!isNaN(date.getTime())) {
        debugLog('parseApiDate', 'Unix timestamp parsing successful:', date.toISOString());
        return date;
      }
    }

    // Standard parsing for other cases
    let date = new Date(dateInput);
    
    if (!isNaN(date.getTime())) {
      debugLog('parseApiDate', 'Final parsing successful:', date);
      return date;
    }
    
    errorLog('parseApiDate', 'Failed to parse date', null, dateInput);
    return null;
  } catch (error) {
    errorLog('parseApiDate', 'Error parsing date', error, dateInput);
    return null;
  }
};

/**
 * Format relative time for notifications (e.g., "2min", "1h", "3d")
 * @param {*} timestamp - Timestamp from notification
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    let date;
    
    // Handle array format from Java LocalDateTime/Instant
    if (Array.isArray(timestamp)) {
      date = new Date(
        timestamp[0],
        timestamp[1] - 1,
        timestamp[2] || 1,
        timestamp[3] || 0,
        timestamp[4] || 0,
        timestamp[5] || 0,
        (timestamp[6] || 0) / 1000000 // nanoseconds to milliseconds
      );
    } 
    // Handle Unix timestamp (number)
    else if (typeof timestamp === 'number') {
      // If timestamp is less than year 2000 in milliseconds, it's likely in seconds
      const ts = timestamp < 946684800000 ? timestamp * 1000 : timestamp;
      date = new Date(ts);
    } 
    // Handle string format
    else {
      date = parseApiDate(timestamp);
    }
    
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    // For older notifications, show actual date
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch (error) {
    errorLog('formatRelativeTime', 'Error formatting relative time', error, timestamp);
    return '';
  }
};

/**
 * Format notification timestamp with timezone awareness
 * @param {*} timestamp - Timestamp from notification
 * @returns {string} - Formatted timestamp
 */
export const formatNotificationTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    let date;
    
    // Handle array format from Java LocalDateTime/Instant
    if (Array.isArray(timestamp)) {
      date = new Date(
        timestamp[0],
        timestamp[1] - 1,
        timestamp[2] || 1,
        timestamp[3] || 0,
        timestamp[4] || 0,
        timestamp[5] || 0,
        (timestamp[6] || 0) / 1000000 // nanoseconds to milliseconds
      );
    } 
    // Handle Unix timestamp (number)
    else if (typeof timestamp === 'number') {
      // If timestamp is less than year 2000 in milliseconds, it's likely in seconds
      const ts = timestamp < 946684800000 ? timestamp * 1000 : timestamp;
      date = new Date(ts);
    } 
    // Handle string format and other cases
    else {
      date = parseApiDate(timestamp);
    }
    
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // Show relative time for recent notifications
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    // Show full date for older notifications
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  } catch (error) {
    errorLog('formatNotificationTimestamp', 'Error formatting notification timestamp', error, timestamp);
    return '';
  }
};

/**
 * Group notifications by date for sectioned display
 * @param {Array} notifications - Array of notifications
 * @returns {Array} - Sectioned data with title and data
 */
export const groupNotificationsByDate = (notifications) => {
  if (!Array.isArray(notifications)) return [];
  
  const grouped = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  notifications.forEach(notification => {
    const timestamp = notification.timestamp || notification.createdAt;
    let date;
    
    // Handle array format from Java LocalDateTime/Instant
    if (Array.isArray(timestamp)) {
      date = new Date(
        timestamp[0],
        timestamp[1] - 1,
        timestamp[2] || 1,
        timestamp[3] || 0,
        timestamp[4] || 0,
        timestamp[5] || 0,
        (timestamp[6] || 0) / 1000000 // nanoseconds to milliseconds
      );
    } 
    // Handle Unix timestamp (number)
    else if (typeof timestamp === 'number') {
      // If timestamp is less than year 2000 in milliseconds, it's likely in seconds
      const ts = timestamp < 946684800000 ? timestamp * 1000 : timestamp;
      date = new Date(ts);
    } 
    // Handle string format and other cases
    else {
      date = parseApiDate(timestamp);
    }
    
    if (!date || isNaN(date.getTime())) return;
    
    let dateKey;
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      dateKey = 'Hoje';
    } else if (isYesterday) {
      dateKey = 'Ontem';
    } else {
      const diffDays = Math.floor((today - date) / 86400000);
      if (diffDays < 7) {
        dateKey = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        dateKey = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
      } else {
        dateKey = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: diffDays > 365 ? 'numeric' : undefined
        });
      }
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(notification);
  });
  
  // Convert to array and sort by date (newest first)
  return Object.entries(grouped)
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      if (a.title === 'Hoje') return -1;
      if (b.title === 'Hoje') return 1;
      if (a.title === 'Ontem') return -1;
      if (b.title === 'Ontem') return 1;
      return 0; // Keep relative order for other dates
    });
};