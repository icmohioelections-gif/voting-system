<?php
/**
 * Google Sheets API Integration
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Vote_Secure_Google_Sheets_API
 * 
 * Handles Google Sheets API interactions
 */
class Vote_Secure_Google_Sheets_API {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * Google Sheets client email
     */
    private $client_email;
    
    /**
     * Google Sheets private key
     */
    private $private_key;
    
    /**
     * Default spreadsheet ID
     */
    private $spreadsheet_id;
    
    /**
     * Get single instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->load_credentials();
    }
    
    /**
     * Load credentials from WordPress options
     */
    private function load_credentials() {
        $settings = get_option('vote_secure_settings', array());
        
        $this->client_email = isset($settings['google_sheets_client_email']) ? $settings['google_sheets_client_email'] : '';
        $this->private_key = isset($settings['google_sheets_private_key']) ? $settings['google_sheets_private_key'] : '';
        $this->spreadsheet_id = isset($settings['google_sheets_spreadsheet_id']) ? $settings['google_sheets_spreadsheet_id'] : '';
    }
    
    /**
     * Check if credentials are configured
     */
    public function is_configured() {
        return !empty($this->client_email) && !empty($this->private_key);
    }
    
    /**
     * Reload credentials
     */
    public function reload_credentials() {
        $this->load_credentials();
    }
    
    /**
     * Generate JWT token for Google API authentication
     */
    private function generate_jwt_token() {
        $now = time();
        $exp = $now + 3600; // 1 hour
        
        $header = array(
            'alg' => 'RS256',
            'typ' => 'JWT',
        );
        
        $payload = array(
            'iss' => $this->client_email,
            'scope' => 'https://www.googleapis.com/auth/spreadsheets',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $exp,
            'iat' => $now,
        );
        
        $base64_header = $this->base64url_encode(wp_json_encode($header));
        $base64_payload = $this->base64url_encode(wp_json_encode($payload));
        
        $signature_input = $base64_header . '.' . $base64_payload;
        
        // Fix private key formatting
        $private_key = str_replace('\\n', "\n", $this->private_key);
        
        // Sign with private key
        $signature = '';
        $key_resource = openssl_pkey_get_private($private_key);
        
        if (!$key_resource) {
            return new WP_Error('invalid_key', __('Invalid private key format.', 'vote-secure-admin'));
        }
        
        openssl_sign($signature_input, $signature, $key_resource, OPENSSL_ALGO_SHA256);
        
        $base64_signature = $this->base64url_encode($signature);
        
        return $base64_header . '.' . $base64_payload . '.' . $base64_signature;
    }
    
    /**
     * Base64 URL encode
     */
    private function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Get access token from Google
     */
    private function get_access_token() {
        $jwt = $this->generate_jwt_token();
        
        if (is_wp_error($jwt)) {
            return $jwt;
        }
        
        $response = wp_remote_post('https://oauth2.googleapis.com/token', array(
            'body' => array(
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ),
            'timeout' => 30,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            return new WP_Error('auth_error', $body['error_description'] ?? $body['error']);
        }
        
        return $body['access_token'];
    }
    
    /**
     * Make API request to Google Sheets
     */
    private function request($endpoint, $method = 'GET', $data = null) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', __('Google Sheets credentials are not configured.', 'vote-secure-admin'));
        }
        
        $access_token = $this->get_access_token();
        
        if (is_wp_error($access_token)) {
            return $access_token;
        }
        
        $url = 'https://sheets.googleapis.com/v4/spreadsheets/' . $endpoint;
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json',
            ),
            'timeout' => 30,
        );
        
        if ($data !== null && in_array($method, array('POST', 'PUT'))) {
            $args['body'] = wp_json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($response_code >= 400) {
            $error_message = isset($body['error']['message']) ? $body['error']['message'] : 'Unknown error';
            return new WP_Error('sheets_error', $error_message, array('status' => $response_code));
        }
        
        return $body;
    }
    
    /**
     * Test connection to Google Sheets
     */
    public function test_connection() {
        if (!$this->is_configured()) {
            return array(
                'success' => false,
                'message' => __('Google Sheets credentials are not configured.', 'vote-secure-admin'),
            );
        }
        
        $access_token = $this->get_access_token();
        
        if (is_wp_error($access_token)) {
            return array(
                'success' => false,
                'message' => $access_token->get_error_message(),
            );
        }
        
        return array(
            'success' => true,
            'message' => __('Successfully connected to Google Sheets API!', 'vote-secure-admin'),
        );
    }
    
    /**
     * Get sheet metadata
     */
    public function get_spreadsheet_metadata($spreadsheet_id = null) {
        $sheet_id = $spreadsheet_id ?: $this->spreadsheet_id;
        
        if (empty($sheet_id)) {
            return new WP_Error('no_spreadsheet', __('No spreadsheet ID provided.', 'vote-secure-admin'));
        }
        
        return $this->request($sheet_id);
    }
    
    /**
     * Get sheet name from metadata
     */
    public function get_sheet_name($spreadsheet_id = null) {
        $metadata = $this->get_spreadsheet_metadata($spreadsheet_id);
        
        if (is_wp_error($metadata)) {
            return 'Sheet1'; // Default fallback
        }
        
        if (isset($metadata['sheets'][0]['properties']['title'])) {
            return $metadata['sheets'][0]['properties']['title'];
        }
        
        return 'Sheet1';
    }
    
    /**
     * Get values from sheet
     */
    public function get_values($range, $spreadsheet_id = null) {
        $sheet_id = $spreadsheet_id ?: $this->spreadsheet_id;
        
        if (empty($sheet_id)) {
            return new WP_Error('no_spreadsheet', __('No spreadsheet ID provided.', 'vote-secure-admin'));
        }
        
        return $this->request($sheet_id . '/values/' . urlencode($range));
    }
    
    /**
     * Update values in sheet
     */
    public function update_values($range, $values, $spreadsheet_id = null) {
        $sheet_id = $spreadsheet_id ?: $this->spreadsheet_id;
        
        if (empty($sheet_id)) {
            return new WP_Error('no_spreadsheet', __('No spreadsheet ID provided.', 'vote-secure-admin'));
        }
        
        $url = $sheet_id . '/values/' . urlencode($range) . '?valueInputOption=USER_ENTERED';
        
        return $this->request($url, 'PUT', array('values' => $values));
    }
    
    /**
     * Extract spreadsheet ID from URL
     */
    public static function extract_spreadsheet_id($url) {
        // Pattern: https://docs.google.com/spreadsheets/d/{spreadsheet_id}/...
        if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    /**
     * Sync voters from Google Sheets
     */
    public function sync_voters_from_sheet($spreadsheet_id = null) {
        $sheet_id = $spreadsheet_id ?: $this->spreadsheet_id;
        
        if (empty($sheet_id)) {
            return new WP_Error('no_spreadsheet', __('No spreadsheet ID provided.', 'vote-secure-admin'));
        }
        
        // Get sheet name
        $sheet_name = $this->get_sheet_name($sheet_id);
        
        // Get all values
        $range = $sheet_name . '!A1:E1000';
        $result = $this->get_values($range, $sheet_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        $rows = isset($result['values']) ? $result['values'] : array();
        
        if (empty($rows)) {
            return array(
                'success' => true,
                'synced' => 0,
                'message' => __('No data found in Google Sheets.', 'vote-secure-admin'),
            );
        }
        
        // Check if first row is header
        $first_row = $rows[0];
        $is_header = false;
        
        foreach ($first_row as $cell) {
            $cell_lower = strtolower($cell);
            if (strpos($cell_lower, 'election') !== false || 
                strpos($cell_lower, 'code') !== false || 
                strpos($cell_lower, 'first') !== false || 
                strpos($cell_lower, 'name') !== false || 
                strpos($cell_lower, 'last') !== false || 
                strpos($cell_lower, 'voted') !== false) {
                $is_header = true;
                break;
            }
        }
        
        $data_rows = $is_header ? array_slice($rows, 1) : $rows;
        
        // Get Supabase client
        $supabase = Vote_Secure_Supabase_Client::get_instance();
        
        $synced = 0;
        $errors = 0;
        
        foreach ($data_rows as $index => $row) {
            $row_index = $is_header ? $index + 2 : $index + 1;
            
            // Check format
            if (count($row) >= 2 && !empty($row[0]) && !empty($row[1])) {
                // Detailed format: election_code, first_name, last_name, has_voted, voted_at
                $voter_data = array(
                    'election_code' => trim($row[0]),
                    'first_name' => trim($row[1]),
                    'last_name' => isset($row[2]) ? trim($row[2]) : null,
                    'has_voted' => isset($row[3]) && ($row[3] === 'TRUE' || $row[3] === 'true' || $row[3] === true),
                    'voted_at' => isset($row[4]) && !empty($row[4]) ? $row[4] : null,
                    'voting_start_date' => gmdate('Y-m-d\TH:i:s\Z'),
                );
            } elseif (!empty($row[0])) {
                // Simple format: just name
                $full_name = trim($row[0]);
                $parsed = Vote_Secure_Election_Codes::parse_name($full_name);
                
                if (empty($parsed['first_name'])) {
                    continue;
                }
                
                $election_code = Vote_Secure_Election_Codes::generate_election_code($full_name, $row_index);
                
                $voter_data = array(
                    'election_code' => $election_code,
                    'first_name' => $parsed['first_name'],
                    'last_name' => $parsed['last_name'],
                    'has_voted' => false,
                    'voted_at' => null,
                    'voting_start_date' => gmdate('Y-m-d\TH:i:s\Z'),
                );
            } else {
                continue;
            }
            
            // Upsert voter
            $result = $supabase->upsert_voter($voter_data);
            
            if (is_wp_error($result)) {
                $errors++;
            } else {
                $synced++;
            }
        }
        
        return array(
            'success' => true,
            'synced' => $synced,
            'errors' => $errors,
            'message' => sprintf(
                __('Synced %d voters. %d errors.', 'vote-secure-admin'),
                $synced,
                $errors
            ),
        );
    }
    
    /**
     * Update voter status in Google Sheets
     */
    public function update_voter_in_sheet($election_code, $voted_at, $spreadsheet_id = null) {
        $sheet_id = $spreadsheet_id ?: $this->spreadsheet_id;
        
        if (empty($sheet_id)) {
            return new WP_Error('no_spreadsheet', __('No spreadsheet ID provided.', 'vote-secure-admin'));
        }
        
        // Get sheet name
        $sheet_name = $this->get_sheet_name($sheet_id);
        
        // Get all values to find the row
        $range = $sheet_name . '!A2:E1000';
        $result = $this->get_values($range, $sheet_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        $rows = isset($result['values']) ? $result['values'] : array();
        
        // Find the row with matching election code
        $row_index = -1;
        foreach ($rows as $index => $row) {
            if (isset($row[0]) && trim($row[0]) === $election_code) {
                $row_index = $index;
                break;
            }
        }
        
        if ($row_index === -1) {
            return new WP_Error('not_found', __('Election code not found in Google Sheets.', 'vote-secure-admin'));
        }
        
        // Update the row (row_index + 2 because we start at row 2)
        $update_range = $sheet_name . '!D' . ($row_index + 2) . ':E' . ($row_index + 2);
        
        return $this->update_values($update_range, array(array(true, $voted_at)), $sheet_id);
    }
}

