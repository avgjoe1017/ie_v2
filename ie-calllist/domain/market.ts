import type { Feed } from './contracts';

/**
 * US timezone mapping by state/region
 * Used for time conversions and display
 */
export const TIMEZONE_MAP: Record<string, string> = {
  // Eastern
  'CT': 'America/Chicago',
  'FL': 'America/New_York',
  'GA': 'America/New_York',
  'IL': 'America/Chicago',
  'IN': 'America/Indiana/Indianapolis',
  'KY': 'America/Kentucky/Louisville',
  'MA': 'America/New_York',
  'MD': 'America/New_York',
  'ME': 'America/New_York',
  'MI': 'America/Detroit',
  'NC': 'America/New_York',
  'NH': 'America/New_York',
  'NJ': 'America/New_York',
  'NY': 'America/New_York',
  'OH': 'America/New_York',
  'PA': 'America/New_York',
  'RI': 'America/New_York',
  'SC': 'America/New_York',
  'TN': 'America/Chicago',
  'VA': 'America/New_York',
  'VT': 'America/New_York',
  'WV': 'America/New_York',
  'DC': 'America/New_York',
  'DE': 'America/New_York',
  // Central
  'AL': 'America/Chicago',
  'AR': 'America/Chicago',
  'IA': 'America/Chicago',
  'KS': 'America/Chicago',
  'LA': 'America/Chicago',
  'MN': 'America/Chicago',
  'MO': 'America/Chicago',
  'MS': 'America/Chicago',
  'ND': 'America/Chicago',
  'NE': 'America/Chicago',
  'OK': 'America/Chicago',
  'SD': 'America/Chicago',
  'TX': 'America/Chicago',
  'WI': 'America/Chicago',
  // Mountain
  'AZ': 'America/Phoenix',
  'CO': 'America/Denver',
  'ID': 'America/Boise',
  'MT': 'America/Denver',
  'NM': 'America/Denver',
  'UT': 'America/Denver',
  'WY': 'America/Denver',
  'NV': 'America/Los_Angeles',
  // Pacific
  'CA': 'America/Los_Angeles',
  'OR': 'America/Los_Angeles',
  'WA': 'America/Los_Angeles',
  // Alaska/Hawaii
  'AK': 'America/Anchorage',
  'HI': 'Pacific/Honolulu',
  // Territories
  'PR': 'America/Puerto_Rico',
  'VI': 'America/Virgin',
  'GU': 'Pacific/Guam',
};

/**
 * Feed time labels and colors
 */
export const FEED_CONFIG: Record<Feed, { label: string; color: string; bgColor: string }> = {
  '3pm': {
    label: '3PM',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
  },
  '5pm': {
    label: '5PM',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  '6pm': {
    label: '6PM',
    color: 'text-violet-700 dark:text-violet-300',
    bgColor: 'bg-violet-50 dark:bg-violet-900/30',
  },
};

/**
 * Broadcast status configuration
 */
export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  'live': {
    label: 'LIVE',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  'rerack': {
    label: 'RERACK',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
  },
  'might': {
    label: 'MIGHT',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700/50',
  },
};

/**
 * Parses air time string from CSV
 */
export function parseAirTime(timeStr: string): string {
  if (!timeStr || timeStr.trim() === '') {
    return '';
  }
  return timeStr.trim().toUpperCase();
}

/**
 * Gets a formatted broadcast time label
 */
export function getBroadcastTimeLabel(local: string, et: string): string {
  if (!local && !et) return 'Time TBD';
  if (!local) return `${et} ET`;
  if (!et) return `${local} local`;
  return `${local} local / ${et} ET`;
}

/**
 * Extracts state code from market name
 */
export function extractStateCode(marketName: string): string | null {
  const match = marketName.match(/,\s*([A-Z]{2})$/);
  return match ? match[1] : null;
}

/**
 * Normalizes feed string from CSV to enum value
 */
export function normalizeFeed(feedStr: string): Feed {
  const cleaned = feedStr.toLowerCase().trim();
  if (cleaned.includes('3') || cleaned === '3pm') return '3pm';
  if (cleaned.includes('5') || cleaned === '5pm') return '5pm';
  if (cleaned.includes('6') || cleaned === '6pm') return '6pm';
  return '6pm';
}

/**
 * Normalizes broadcast status from CSV
 */
export function normalizeStatus(statusStr: string | undefined | null): 'live' | 'rerack' | 'might' | null {
  if (!statusStr || statusStr.trim() === '') return null;
  const cleaned = statusStr.toLowerCase().trim();
  if (cleaned === 'live') return 'live';
  if (cleaned === 'rerack') return 'rerack';
  if (cleaned === 'might') return 'might';
  return null;
}

/**
 * Formats market number for display
 */
export function formatMarketNumber(num: number): string {
  return `Market #${num}`;
}
