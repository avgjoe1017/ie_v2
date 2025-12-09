import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * Validates a phone number string
 * @param phone - The phone number to validate
 * @param country - Default country code (default: US)
 * @returns true if valid, false otherwise
 */
export function validatePhone(phone: string, country: CountryCode = 'US'): boolean {
  try {
    return isValidPhoneNumber(phone, country);
  } catch {
    return false;
  }
}

/**
 * Formats a phone number to E.164 format (+1XXXXXXXXXX)
 * @param phone - The phone number to format
 * @param country - Default country code (default: US)
 * @returns E.164 formatted number or original if invalid
 */
export function formatE164(phone: string, country: CountryCode = 'US'): string {
  try {
    const parsed = parsePhoneNumber(phone, country);
    if (parsed) {
      return parsed.format('E.164');
    }
  } catch {
    // Return original if parsing fails
  }
  return phone;
}

/**
 * Formats a phone number for display (e.g., (312) 555-1234)
 * @param phone - The phone number to format
 * @param country - Default country code (default: US)
 * @returns Formatted display string
 */
export function formatDisplay(phone: string, country: CountryCode = 'US'): string {
  try {
    const parsed = parsePhoneNumber(phone, country);
    if (parsed) {
      return parsed.formatNational();
    }
  } catch {
    // Return original if parsing fails
  }
  return phone;
}

/**
 * Strips all non-numeric characters from a phone string
 * @param phone - The phone number to clean
 * @returns Digits only
 */
export function stripNonNumeric(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Creates a tel: link for tap-to-call
 * @param phone - The phone number
 * @returns tel: URI
 */
export function createTelLink(phone: string): string {
  const cleaned = stripNonNumeric(phone);
  return `tel:+1${cleaned.replace(/^1/, '')}`;
}

/**
 * Parses phone from CSV format (may have various formats)
 * @param phone - Raw phone string from CSV
 * @returns Cleaned and validated phone number
 */
export function parseCSVPhone(phone: string): string | null {
  if (!phone || phone.trim() === '') {
    return null;
  }
  
  // Clean up the phone string
  const cleaned = phone.trim();
  
  // Try to format to E.164
  const e164 = formatE164(cleaned);
  
  // Validate
  if (validatePhone(e164)) {
    return e164;
  }
  
  // If invalid but has enough digits, store as-is
  const digits = stripNonNumeric(cleaned);
  if (digits.length >= 10) {
    return `+1${digits.replace(/^1/, '')}`;
  }
  
  return null;
}

