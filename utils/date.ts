import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @param formatString - Format pattern (default: 'MMM dd, yyyy')
 */
export const formatDate = (
  date: string | Date,
  formatString = 'MMM dd, yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, new Date());
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'hh:mm a');
};