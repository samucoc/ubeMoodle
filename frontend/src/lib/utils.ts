import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActivityType } from '@/types';

/**
 * Merge Tailwind CSS classes with clsx + tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: string | Date,
  dateFormat: string = 'dd/MM/yyyy',
): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, dateFormat, { locale: es });
}

/**
 * Format a date as relative time (e.g., "hace 5 minutos")
 */
export function formatRelativeTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true, locale: es });
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Get initials from first and last name
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
}

/**
 * Get a lucide icon name for an activity type
 */
export function getActivityIcon(activityType: ActivityType): string {
  const iconMap: Record<ActivityType, string> = {
    [ActivityType.ASSIGNMENT]: 'ClipboardList',
    [ActivityType.QUIZ]: 'HelpCircle',
    [ActivityType.FORUM]: 'MessageSquare',
    [ActivityType.RESOURCE]: 'File',
    [ActivityType.URL]: 'ExternalLink',
    [ActivityType.PAGE]: 'FileText',
    [ActivityType.LABEL]: 'Tag',
    [ActivityType.FOLDER]: 'Folder',
    [ActivityType.VIDEO]: 'Video',
    [ActivityType.LESSON]: 'BookOpen',
    [ActivityType.WORKSHOP]: 'Hammer',
    [ActivityType.WIKI]: 'Globe',
    [ActivityType.GLOSSARY]: 'BookA',
    [ActivityType.H5P]: 'Puzzle',
  };
  return iconMap[activityType] || 'File';
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Generate a consistent HSL color from a name string
 */
export function generateAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 50%)`;
}
