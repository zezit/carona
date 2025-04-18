/**
 * Utility functions for date and time formatting
 */

// Format a date string or Date object to a readable date format (DD/MM/YYYY)
export const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Erro ao formatar data';
  }
};

// Format a date string or Date object to a readable time format (HH:MM)
export const formatTime = (dateString) => {
  if (!dateString) return 'Horário não informado';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Horário inválido';
    
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Erro ao formatar horário';
  }
};

// Format a date string or Date object to a readable date and time format (DD/MM/YYYY HH:MM)
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Data e hora não informadas';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data e hora inválidas';
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Erro ao formatar data e hora';
  }
};

// Get a relative time string (e.g., "Today", "Yesterday", "3 days ago")
export const getRelativeTimeString = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays > 1 && diffDays < 7) {
      return `Há ${diffDays} dias`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

// Format date for API requests (YYYY-MM-DD)
export const formatDateForApi = (date) => {
  if (!date) return null;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return null;
  }
};

// Format date and time for API requests (YYYY-MM-DDTHH:MM:SS)
export const formatDateTimeForApi = (date, time) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    // If time is provided, set the hours and minutes
    if (time) {
      const [hours, minutes] = time.split(':');
      dateObj.setHours(parseInt(hours, 10));
      dateObj.setMinutes(parseInt(minutes, 10));
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date time for API:', error);
    return null;
  }
};