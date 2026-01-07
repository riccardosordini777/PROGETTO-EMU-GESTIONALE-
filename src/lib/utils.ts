import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const countryNormalizationMap: { [key: string]: string } = {
  'francia': 'France', 'france': 'France',
  'germany': 'Germany', 'germania': 'Germany',
  'italia': 'Italy', 'italy': 'Italy',
  'spagna': 'Spain', 'spain': 'Spain',
  'united kingdom': 'United Kingdom', 'regno unito': 'United Kingdom',
  'united states': 'United States', 'stati uniti': 'United States', 'usa': 'United States',
  'canada': 'Canada',
  'mexico': 'Mexico',
  'brazil': 'Brazil', 'brasile': 'Brazil',
  'argentina': 'Argentina',
  'australia': 'Australia',
  'japan': 'Japan', 'giappone': 'Japan',
  'china': 'China',
  'india': 'India',
  // Add more mappings for common variations and translations as needed
};

export function normalizeCountryName(inputName: string): string {
  if (!inputName) return '';
  const lowerInput = inputName.toLowerCase();
  return countryNormalizationMap[lowerInput] || inputName; // Return normalized name or original if not found
}


// This is an innocuous comment to force a new build.
export function getCountryCode(countryName: string): string | undefined {
  if (!countryName) return undefined;
  
  const normalizedName = normalizeCountryName(countryName); // Use the new normalization function

  const countryCodeMap: { [key: string]: string } = {
    'France': 'FR', 'Germany': 'DE', 'Italy': 'IT', 'Spain': 'ES', 'United Kingdom': 'GB', 
    'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX', 'Brazil': 'BR', 'Argentina': 'AR', 
    'Australia': 'AU', 'Japan': 'JP', 'China': 'CN', 'India': 'IN',
  };

  return countryCodeMap[normalizedName]; // Lookup using the normalized name
}
