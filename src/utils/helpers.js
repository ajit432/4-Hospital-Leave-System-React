import { format, parseISO, isValid } from 'date-fns';

// Format date for display
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  try {
    if (!date) return '';
    
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(parsedDate)) return '';
    
    return format(parsedDate, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Format date for form inputs
export const formatDateForInput = (date) => {
  try {
    if (!date) return '';
    
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(parsedDate)) return '';
    
    return format(parsedDate, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Calculate days between two dates
export const calculateDaysBetween = (startDate, endDate) => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
    
    return diffDays;
  } catch (error) {
    console.error('Date calculation error:', error);
    return 0;
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file type
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

// Get status color class
export const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate avatar fallback
export const getAvatarFallback = (name) => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength: !minLength ? 'Password must be at least 6 characters long' : null,
      hasUpperCase: !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
      hasLowerCase: !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
      hasNumbers: !hasNumbers ? 'Password must contain at least one number' : null,
    }
  };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Normalize date to YYYY-MM-DD format for consistent comparison
export const normalizeDate = (dateString) => {
  if (!dateString) return null;
  
  // If date is already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // If date is in DD-MM-YYYY format, convert to YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse as Date and format as YYYY-MM-DD
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return format(date, 'yyyy-MM-dd');
  }
  
  return dateString;
};

// Leave validation helpers
export const validateLeaveDates = (startDate, endDate) => {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Start date cannot be in the past
  if (start < today) {
    errors.startDate = 'Start date cannot be in the past. For retrospective applications, contact admin.';
  }
  
  // End date must be >= start date
  if (end < start) {
    errors.endDate = 'End date must be on or after start date';
  }
  
  // Check if dates are valid
  if (isNaN(start.getTime())) {
    errors.startDate = 'Invalid start date';
  }
  
  if (isNaN(end.getTime())) {
    errors.endDate = 'Invalid end date';
  }
  
  return errors;
};

export const validateLeaveReason = (reason) => {
  const errors = {};
  
  if (!reason || reason.trim().length === 0) {
    errors.reason = 'Reason is required';
  } else if (reason.trim().length < 10) {
    errors.reason = 'Reason must be at least 10 characters';
  } else if (reason.length > 500) {
    errors.reason = 'Reason cannot exceed 500 characters';
  }
  
  return errors;
};

export const validateLeaveCategory = (categoryId, categories) => {
  const errors = {};
  
  if (!categoryId) {
    errors.categoryId = 'Leave category is required';
  } else {
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    if (!category) {
      errors.categoryId = 'Invalid leave category selected';
    } else if (!category.is_active) {
      errors.categoryId = 'Selected leave category is not active';
    }
  }
  
  return errors;
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};
