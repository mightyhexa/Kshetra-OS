/**
 * Bhu-Aadhaar ULPIN (Unique Land Parcel Identification Number)
 * Format: 14 characters (2-letter state code + 12 alphanumeric characters)
 * Display grouped as: XX-XXXX-XXXX-XXXX
 */

const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Deterministically generates a 14-character ULPIN from state code, coordinates, and survey number.
 */
export function generateUlpin(stateCode: string, lat: number, lon: number, surveyNumber: string): string {
  const cleanState = stateCode.toUpperCase().slice(0, 2);
  
  // Integer representations of 4-decimal precision coordinates
  const latInt = Math.floor(Math.abs(lat) * 10000);
  const lonInt = Math.floor(Math.abs(lon) * 10000);
  
  // Deterministic hash integer from survey number
  let surveyHash = 0;
  for (let i = 0; i < surveyNumber.length; i++) {
    surveyHash = (surveyHash * 31 + surveyNumber.charCodeAt(i)) & 0xffffffff;
  }
  surveyHash = Math.abs(surveyHash);

  // Combine into a deterministic seed
  const num1 = (latInt * 1000 + (surveyHash % 1000)) >>> 0;
  const num2 = (lonInt * 1000 + ((surveyHash >> 3) % 1000)) >>> 0;

  // Convert to Base36
  let part1 = num1.toString(36).toUpperCase().padStart(6, '0').slice(-6);
  let part2 = num2.toString(36).toUpperCase().padStart(6, '0').slice(-6);

  return `${cleanState}${part1}${part2}`;
}

/**
 * Formats a 14-character ULPIN into XX-XXXX-XXXX-XXXX
 */
export function formatUlpin(ulpin: string): string {
  const clean = cleanUlpin(ulpin);
  if (clean.length !== 14) return ulpin;
  return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}-${clean.slice(10, 14)}`;
}

/**
 * Strips all non-alphanumeric characters and converts to uppercase
 */
export function cleanUlpin(formatted: string): string {
  return formatted.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Validates whether string conforms to 14-character alphanumeric ULPIN standard
 */
export function isValidUlpin(ulpin: string): boolean {
  const clean = cleanUlpin(ulpin);
  return /^[A-Z]{2}[A-Z0-9]{12}$/.test(clean);
}
