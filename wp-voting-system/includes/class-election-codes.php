<?php
/**
 * Election Codes Generator
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Vote_Secure_Election_Codes
 * 
 * Handles generation of unique election codes
 */
class Vote_Secure_Election_Codes {
    
    /**
     * Generate a unique 10-character election code from a name
     * Format: First 5 letters of name + 4 random numbers + 1 random alphabet
     *
     * @param string $name The voter's name
     * @param int|null $index Optional index for additional uniqueness
     * @return string 10-character election code
     */
    public static function generate_election_code($name, $index = null) {
        // Remove spaces and special characters, convert to uppercase, keep only letters
        $clean_name = preg_replace('/[^a-zA-Z]/', '', $name);
        $clean_name = strtoupper($clean_name);
        
        // Take first 5 letters of the name
        $name_part = substr($clean_name, 0, 5);
        
        // If name is shorter than 5 letters, pad with 'X'
        $name_part = str_pad($name_part, 5, 'X', STR_PAD_RIGHT);
        
        // Generate 4 random numbers (0-9)
        $random_numbers = '';
        for ($i = 0; $i < 4; $i++) {
            $random_numbers .= wp_rand(0, 9);
        }
        
        // Generate 1 random alphabet letter (A-Z)
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $random_letter = $alphabet[wp_rand(0, 25)];
        
        // Combine: 5 letters + 4 numbers + 1 letter = 10 characters
        return $name_part . $random_numbers . $random_letter;
    }
    
    /**
     * Parse a full name into first name and last name
     *
     * @param string $full_name The full name to parse
     * @return array Array with 'first_name' and 'last_name' keys
     */
    public static function parse_name($full_name) {
        $trimmed = trim($full_name);
        
        if (empty($trimmed)) {
            return array(
                'first_name' => '',
                'last_name' => null,
            );
        }
        
        // Split by spaces
        $parts = preg_split('/\s+/', $trimmed);
        $parts = array_filter($parts, function($part) {
            return strlen($part) > 0;
        });
        $parts = array_values($parts); // Re-index array
        
        if (count($parts) === 0) {
            return array(
                'first_name' => '',
                'last_name' => null,
            );
        }
        
        if (count($parts) === 1) {
            return array(
                'first_name' => $parts[0],
                'last_name' => null,
            );
        }
        
        // First part is first name, rest is last name
        $first_name = $parts[0];
        array_shift($parts);
        $last_name = implode(' ', $parts);
        
        return array(
            'first_name' => $first_name,
            'last_name' => $last_name,
        );
    }
    
    /**
     * Validate election code format
     *
     * @param string $code The election code to validate
     * @return bool True if valid, false otherwise
     */
    public static function validate_election_code($code) {
        // Must be exactly 10 alphanumeric characters
        return (bool) preg_match('/^[A-Za-z0-9]{10}$/', $code);
    }
}

