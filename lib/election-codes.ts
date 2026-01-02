/**
 * Generate a unique 10-character election code from a name
 * Format: First 5 letters of name + 4 random numbers + 1 random alphabet
 */
export function generateElectionCode(name: string, index?: number): string {
  // Remove spaces and special characters, convert to uppercase, keep only letters
  const cleanName = name
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  
  // Take first 5 letters of the name
  const namePart = cleanName.substring(0, 5);
  
  // If name is shorter than 5 letters, pad with 'X'
  const paddedName = namePart.padEnd(5, 'X');
  
  // Generate 4 random numbers (0-9)
  const randomNumbers = Array.from({ length: 4 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  
  // Generate 1 random alphabet letter (A-Z)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  
  // Combine: 5 letters + 4 numbers + 1 letter = 10 characters
  return paddedName + randomNumbers + randomLetter;
}

/**
 * Parse a full name into first name and last name
 */
export function parseName(fullName: string): { first_name: string; last_name: string | null } {
  const trimmed = fullName.trim();
  
  if (!trimmed) {
    return { first_name: '', last_name: null };
  }
  
  // Split by spaces
  const parts = trimmed.split(/\s+/).filter(part => part.length > 0);
  
  if (parts.length === 0) {
    return { first_name: '', last_name: null };
  }
  
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: null };
  }
  
  // First part is first name, rest is last name
  const first_name = parts[0];
  const last_name = parts.slice(1).join(' ');
  
  return { first_name, last_name };
}


