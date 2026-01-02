/**
 * Generate a unique 10-character alphanumeric election code from a name
 */
export function generateElectionCode(name: string, index?: number): string {
  // Remove spaces and special characters, convert to uppercase
  const cleanName = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, 8); // Take first 8 characters
  
  // Add a 2-digit index to ensure uniqueness (padded with zeros)
  const suffix = index !== undefined ? String(index).padStart(2, '0') : '01';
  
  // Combine to make 10 characters (8 from name + 2 from index)
  let code = (cleanName + suffix).substring(0, 10);
  
  // If code is shorter than 10 characters, pad with random alphanumeric
  while (code.length < 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code.substring(0, 10);
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


