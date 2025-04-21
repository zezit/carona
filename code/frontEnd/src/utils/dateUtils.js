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

export const parseApiDate = (dateInput) => {
  if (!dateInput) {
    debugLog('parseApiDate', 'Null input received');
    return null;
  }
  
  try {
    debugLog('parseApiDate', 'Attempting to parse date:', dateInput);

    if (Array.isArray(dateInput)) {
      debugLog('parseApiDate', 'Parsing array format:', dateInput);
      const result = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], 
        dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);

      debugLog('parseApiDate', 'Parsed date from array:', result);
      return result;
    }

    let date = new Date(dateInput);
    
    if (!isNaN(date.getTime())) {
      debugLog('parseApiDate', 'Standard parsing successful:', date);
      return date;
    }
    
    if (dateString.includes('T') && dateString.includes('-')) {
      debugLog('parseApiDate', 'Attempting alternative format parse');
      const parts = dateString.split('T');
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
    
    errorLog('parseApiDate', 'Failed to parse date', null, dateString);
    return null;
  } catch (error) {
    errorLog('parseApiDate', 'Error parsing date', error, dateString);
    return null;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) {
    debugLog('formatDate', 'Null input received');
    return 'Data não informada';
  }
  
  try {
    debugLog('formatDate', 'Formatting date:', dateString);
    const date = parseApiDate(dateString);
    if (!date) return 'Data inválida';
    
    const result = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    debugLog('formatDate', 'Formatted result:', result);
    return result;
  } catch (error) {
    errorLog('formatDate', 'Error formatting date', error, dateString);
    return 'Erro ao formatar data';
  }
};

export const formatTime = (dateString) => {
  if (!dateString) {
    debugLog('formatTime', 'Null input received');
    return 'Horário não informado';
  }
  
  try {
    debugLog('formatTime', 'Formatting time:', dateString);
    const date = parseApiDate(dateString);
    if (!date) return 'Horário inválido';
    
    const result = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    debugLog('formatTime', 'Formatted result:', result);
    return result;
  } catch (error) {
    errorLog('formatTime', 'Error formatting time', error, dateString);
    return 'Erro ao formatar horário';
  }
};

export const formatDateForApi = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    // Adjust for timezone offset
    const adjustedDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
    // Format as YYYY-MM-DD
    const result = adjustedDate.toISOString();
    debugLog('formatDateForApi', 'Formatted result:', result);
    return result;
  } catch (error) {
    errorLog('formatDateForApi', 'Error formatting date for API', error, date);
    return null;
  }
};