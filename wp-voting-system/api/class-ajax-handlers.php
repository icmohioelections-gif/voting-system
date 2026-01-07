<?php
/**
 * AJAX Handlers
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Vote_Secure_Ajax_Handlers
 * 
 * Handles all AJAX requests for the plugin
 */
class Vote_Secure_Ajax_Handlers {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
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
        $this->register_ajax_handlers();
    }
    
    /**
     * Register AJAX handlers
     */
    private function register_ajax_handlers() {
        // Results
        add_action('wp_ajax_vote_secure_fetch_results', array($this, 'fetch_results'));
        
        // Voters
        add_action('wp_ajax_vote_secure_fetch_voters', array($this, 'fetch_voters'));
        add_action('wp_ajax_vote_secure_add_voter', array($this, 'add_voter'));
        add_action('wp_ajax_vote_secure_upload_csv', array($this, 'upload_csv'));
        
        // Candidates
        add_action('wp_ajax_vote_secure_fetch_candidates', array($this, 'fetch_candidates'));
        add_action('wp_ajax_vote_secure_add_candidate', array($this, 'add_candidate'));
        add_action('wp_ajax_vote_secure_add_default_candidates', array($this, 'add_default_candidates'));
        
        // Google Sheets
        add_action('wp_ajax_vote_secure_sync_sheets', array($this, 'sync_sheets'));
        add_action('wp_ajax_vote_secure_sync_sheet_url', array($this, 'sync_sheet_url'));
        
        // Settings
        add_action('wp_ajax_vote_secure_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_vote_secure_test_supabase', array($this, 'test_supabase'));
        add_action('wp_ajax_vote_secure_test_google_sheets', array($this, 'test_google_sheets'));
        add_action('wp_ajax_vote_secure_reset_db', array($this, 'reset_database'));
    }
    
    /**
     * Verify nonce and capabilities
     */
    private function verify_request() {
        // Check nonce
        if (!check_ajax_referer('vote_secure_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => __('Security check failed.', 'vote-secure-admin')));
        }
        
        // Check capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'vote-secure-admin')));
        }
    }
    
    /**
     * Fetch results
     */
    public function fetch_results() {
        $this->verify_request();
        
        $db = Vote_Secure_Database_Manager::get_instance();
        
        // Get vote counts
        $results = $db->get_vote_counts();
        
        if (is_wp_error($results)) {
            wp_send_json_error(array('message' => $results->get_error_message()));
        }
        
        // Get statistics
        $statistics = $db->get_statistics();
        
        if (is_wp_error($statistics)) {
            wp_send_json_error(array('message' => $statistics->get_error_message()));
        }
        
        wp_send_json_success(array(
            'results' => $results,
            'statistics' => $statistics,
        ));
    }
    
    /**
     * Fetch voters
     */
    public function fetch_voters() {
        $this->verify_request();
        
        $db = Vote_Secure_Database_Manager::get_instance();
        $voters = $db->get_voters();
        
        if (is_wp_error($voters)) {
            wp_send_json_error(array('message' => $voters->get_error_message()));
        }
        
        wp_send_json_success(array('voters' => $voters));
    }
    
    /**
     * Add voter
     */
    public function add_voter() {
        $this->verify_request();
        
        $first_name = isset($_POST['first_name']) ? sanitize_text_field($_POST['first_name']) : '';
        $last_name = isset($_POST['last_name']) ? sanitize_text_field($_POST['last_name']) : '';
        $election_code = isset($_POST['election_code']) ? sanitize_text_field($_POST['election_code']) : '';
        
        // Validate
        if (empty($first_name) || empty($election_code)) {
            wp_send_json_error(array('message' => __('First name and election code are required.', 'vote-secure-admin')));
        }
        
        // Validate election code format
        if (!Vote_Secure_Election_Codes::validate_election_code($election_code)) {
            wp_send_json_error(array('message' => __('Election code must be exactly 10 alphanumeric characters.', 'vote-secure-admin')));
        }
        
        $db = Vote_Secure_Database_Manager::get_instance();
        
        $data = array(
            'election_code' => strtoupper($election_code),
            'first_name' => $first_name,
            'last_name' => $last_name ?: null,
            'has_voted' => false,
            'voted_at' => null,
            'voting_start_date' => gmdate('Y-m-d\TH:i:s\Z'),
        );
        
        $result = $db->add_voter($data);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => __('Voter added successfully!', 'vote-secure-admin'),
            'voter' => $result,
        ));
    }
    
    /**
     * Upload CSV
     */
    public function upload_csv() {
        $this->verify_request();
        
        if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
            wp_send_json_error(array('message' => __('No file uploaded or upload error.', 'vote-secure-admin')));
        }
        
        $file = $_FILES['csv_file'];
        
        // Check file type
        $file_type = wp_check_filetype($file['name']);
        if ($file_type['ext'] !== 'csv') {
            wp_send_json_error(array('message' => __('Please upload a CSV file.', 'vote-secure-admin')));
        }
        
        // Read file
        $content = file_get_contents($file['tmp_name']);
        $lines = explode("\n", $content);
        
        if (empty($lines)) {
            wp_send_json_error(array('message' => __('CSV file is empty.', 'vote-secure-admin')));
        }
        
        $db = Vote_Secure_Database_Manager::get_instance();
        
        $synced = 0;
        $errors = 0;
        $is_header = true;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }
            
            $columns = str_getcsv($line);
            
            // Skip header row
            if ($is_header) {
                $first_col = strtolower($columns[0] ?? '');
                if (strpos($first_col, 'election') !== false || 
                    strpos($first_col, 'code') !== false || 
                    strpos($first_col, 'name') !== false) {
                    $is_header = false;
                    continue;
                }
                $is_header = false;
            }
            
            // Process row
            if (count($columns) >= 2 && !empty($columns[0]) && !empty($columns[1])) {
                // Detailed format: election_code, first_name, last_name
                $voter_data = array(
                    'election_code' => strtoupper(trim($columns[0])),
                    'first_name' => trim($columns[1]),
                    'last_name' => isset($columns[2]) ? trim($columns[2]) : null,
                    'has_voted' => false,
                    'voted_at' => null,
                    'voting_start_date' => gmdate('Y-m-d\TH:i:s\Z'),
                );
            } elseif (!empty($columns[0])) {
                // Simple format: just name
                $full_name = trim($columns[0]);
                $parsed = Vote_Secure_Election_Codes::parse_name($full_name);
                
                if (empty($parsed['first_name'])) {
                    continue;
                }
                
                $election_code = Vote_Secure_Election_Codes::generate_election_code($full_name);
                
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
            
            $result = $db->upsert_voter($voter_data);
            
            if (is_wp_error($result)) {
                $errors++;
            } else {
                $synced++;
            }
        }
        
        wp_send_json_success(array(
            'message' => sprintf(
                __('Imported %d voters. %d errors.', 'vote-secure-admin'),
                $synced,
                $errors
            ),
            'synced' => $synced,
            'errors' => $errors,
        ));
    }
    
    /**
     * Fetch candidates
     */
    public function fetch_candidates() {
        $this->verify_request();
        
        $db = Vote_Secure_Database_Manager::get_instance();
        $candidates = $db->get_candidates();
        
        if (is_wp_error($candidates)) {
            wp_send_json_error(array('message' => $candidates->get_error_message()));
        }
        
        wp_send_json_success(array('candidates' => $candidates));
    }
    
    /**
     * Add candidate
     */
    public function add_candidate() {
        $this->verify_request();
        
        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        $position = isset($_POST['position']) ? sanitize_text_field($_POST['position']) : '';
        $photo_url = isset($_POST['photo_url']) ? esc_url_raw($_POST['photo_url']) : '';
        $description = isset($_POST['description']) ? sanitize_textarea_field($_POST['description']) : '';
        
        // Validate
        if (empty($name) || empty($position)) {
            wp_send_json_error(array('message' => __('Name and position are required.', 'vote-secure-admin')));
        }
        
        $db = Vote_Secure_Database_Manager::get_instance();
        
        $data = array(
            'name' => $name,
            'position' => $position,
            'photo_url' => $photo_url ?: null,
            'description' => $description ?: null,
        );
        
        $result = $db->add_candidate($data);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => __('Candidate added successfully!', 'vote-secure-admin'),
            'candidate' => $result,
        ));
    }
    
    /**
     * Add default candidates
     */
    public function add_default_candidates() {
        $this->verify_request();
        
        $db = Vote_Secure_Database_Manager::get_instance();
        $result = $db->add_default_candidates();
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => sprintf(
                __('Added %d candidates. Skipped %d existing.', 'vote-secure-admin'),
                $result['added'],
                $result['skipped']
            ),
            'added' => $result['added'],
            'skipped' => $result['skipped'],
        ));
    }
    
    /**
     * Sync from Google Sheets (default spreadsheet)
     */
    public function sync_sheets() {
        $this->verify_request();
        
        $sheets = Vote_Secure_Google_Sheets_API::get_instance();
        
        if (!$sheets->is_configured()) {
            wp_send_json_error(array('message' => __('Google Sheets credentials are not configured.', 'vote-secure-admin')));
        }
        
        $result = $sheets->sync_voters_from_sheet();
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * Sync from Google Sheets URL
     */
    public function sync_sheet_url() {
        $this->verify_request();
        
        $sheet_url = isset($_POST['sheet_url']) ? esc_url_raw($_POST['sheet_url']) : '';
        
        if (empty($sheet_url)) {
            wp_send_json_error(array('message' => __('Sheet URL is required.', 'vote-secure-admin')));
        }
        
        // Extract spreadsheet ID
        $spreadsheet_id = Vote_Secure_Google_Sheets_API::extract_spreadsheet_id($sheet_url);
        
        if (empty($spreadsheet_id)) {
            wp_send_json_error(array('message' => __('Invalid Google Sheets URL.', 'vote-secure-admin')));
        }
        
        $sheets = Vote_Secure_Google_Sheets_API::get_instance();
        
        if (!$sheets->is_configured()) {
            wp_send_json_error(array('message' => __('Google Sheets credentials are not configured.', 'vote-secure-admin')));
        }
        
        $result = $sheets->sync_voters_from_sheet($spreadsheet_id);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * Save settings
     */
    public function save_settings() {
        $this->verify_request();
        
        $settings = array(
            'supabase_url' => isset($_POST['supabase_url']) ? esc_url_raw($_POST['supabase_url']) : '',
            'supabase_anon_key' => isset($_POST['supabase_anon_key']) ? sanitize_text_field($_POST['supabase_anon_key']) : '',
            'supabase_service_role_key' => isset($_POST['supabase_service_role_key']) ? sanitize_text_field($_POST['supabase_service_role_key']) : '',
            'google_sheets_spreadsheet_id' => isset($_POST['google_sheets_spreadsheet_id']) ? sanitize_text_field($_POST['google_sheets_spreadsheet_id']) : '',
            'google_sheets_client_email' => isset($_POST['google_sheets_client_email']) ? sanitize_email($_POST['google_sheets_client_email']) : '',
            'google_sheets_private_key' => isset($_POST['google_sheets_private_key']) ? sanitize_textarea_field($_POST['google_sheets_private_key']) : '',
            'app_url' => isset($_POST['app_url']) ? esc_url_raw($_POST['app_url']) : '',
        );
        
        update_option('vote_secure_settings', $settings);
        
        // Reload credentials in clients
        Vote_Secure_Supabase_Client::get_instance()->reload_credentials();
        Vote_Secure_Google_Sheets_API::get_instance()->reload_credentials();
        
        wp_send_json_success(array('message' => __('Settings saved successfully!', 'vote-secure-admin')));
    }
    
    /**
     * Test Supabase connection
     */
    public function test_supabase() {
        $this->verify_request();
        
        $supabase = Vote_Secure_Supabase_Client::get_instance();
        $result = $supabase->test_connection();
        
        if ($result['success']) {
            wp_send_json_success(array('message' => $result['message']));
        } else {
            wp_send_json_error(array('message' => $result['message']));
        }
    }
    
    /**
     * Test Google Sheets connection
     */
    public function test_google_sheets() {
        $this->verify_request();
        
        $sheets = Vote_Secure_Google_Sheets_API::get_instance();
        $result = $sheets->test_connection();
        
        if ($result['success']) {
            wp_send_json_success(array('message' => $result['message']));
        } else {
            wp_send_json_error(array('message' => $result['message']));
        }
    }
    
    /**
     * Reset database
     */
    public function reset_database() {
        $this->verify_request();
        
        // Double-check confirmation
        $confirm = isset($_POST['confirm']) ? $_POST['confirm'] : '';
        
        if ($confirm !== 'RESET') {
            wp_send_json_error(array('message' => __('Please type RESET to confirm.', 'vote-secure-admin')));
        }
        
        $db = Vote_Secure_Database_Manager::get_instance();
        $result = $db->reset_database();
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => __('Database has been reset successfully!', 'vote-secure-admin'),
            'results' => $result,
        ));
    }
}

