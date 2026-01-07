<?php
/**
 * Supabase Client
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Vote_Secure_Supabase_Client
 * 
 * Handles all Supabase API interactions
 */
class Vote_Secure_Supabase_Client {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * Supabase URL
     */
    private $supabase_url;
    
    /**
     * Supabase Anon Key
     */
    private $supabase_anon_key;
    
    /**
     * Supabase Service Role Key
     */
    private $supabase_service_role_key;
    
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
        
        $this->supabase_url = isset($settings['supabase_url']) ? $settings['supabase_url'] : '';
        $this->supabase_anon_key = isset($settings['supabase_anon_key']) ? $settings['supabase_anon_key'] : '';
        $this->supabase_service_role_key = isset($settings['supabase_service_role_key']) ? $settings['supabase_service_role_key'] : '';
    }
    
    /**
     * Check if credentials are configured
     */
    public function is_configured() {
        return !empty($this->supabase_url) && !empty($this->supabase_service_role_key);
    }
    
    /**
     * Reload credentials (useful after settings update)
     */
    public function reload_credentials() {
        $this->load_credentials();
    }
    
    /**
     * Make API request to Supabase
     *
     * @param string $endpoint The API endpoint (e.g., 'voters')
     * @param string $method HTTP method (GET, POST, PATCH, DELETE)
     * @param array $data Data to send (for POST/PATCH)
     * @param array $params Query parameters
     * @param bool $use_service_role Use service role key instead of anon key
     * @return array|WP_Error Response data or error
     */
    public function request($endpoint, $method = 'GET', $data = null, $params = array(), $use_service_role = true) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', __('Supabase credentials are not configured.', 'vote-secure-admin'));
        }
        
        $url = trailingslashit($this->supabase_url) . 'rest/v1/' . $endpoint;
        
        // Add query parameters
        if (!empty($params)) {
            $url = add_query_arg($params, $url);
        }
        
        $headers = array(
            'apikey' => $use_service_role ? $this->supabase_service_role_key : $this->supabase_anon_key,
            'Authorization' => 'Bearer ' . ($use_service_role ? $this->supabase_service_role_key : $this->supabase_anon_key),
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation',
        );
        
        $args = array(
            'method' => $method,
            'headers' => $headers,
            'timeout' => 30,
        );
        
        if ($data !== null && in_array($method, array('POST', 'PATCH', 'PUT'))) {
            $args['body'] = wp_json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        
        if ($response_code >= 400) {
            $error_message = isset($decoded['message']) ? $decoded['message'] : 'Unknown error';
            return new WP_Error('supabase_error', $error_message, array('status' => $response_code));
        }
        
        return $decoded;
    }
    
    /**
     * Test connection to Supabase
     */
    public function test_connection() {
        $result = $this->request('voters', 'GET', null, array('limit' => 1));
        
        if (is_wp_error($result)) {
            return array(
                'success' => false,
                'message' => $result->get_error_message(),
            );
        }
        
        return array(
            'success' => true,
            'message' => __('Successfully connected to Supabase!', 'vote-secure-admin'),
        );
    }
    
    // ==========================================
    // VOTERS CRUD Operations
    // ==========================================
    
    /**
     * Get all voters
     */
    public function get_voters($order_by = 'created_at', $ascending = false) {
        $params = array(
            'order' => $order_by . '.' . ($ascending ? 'asc' : 'desc'),
        );
        
        return $this->request('voters', 'GET', null, $params);
    }
    
    /**
     * Get voter by election code
     */
    public function get_voter_by_code($election_code) {
        $params = array(
            'election_code' => 'eq.' . $election_code,
        );
        
        $result = $this->request('voters', 'GET', null, $params);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return !empty($result) ? $result[0] : null;
    }
    
    /**
     * Add a new voter
     */
    public function add_voter($data) {
        return $this->request('voters', 'POST', $data);
    }
    
    /**
     * Update voter
     */
    public function update_voter($election_code, $data) {
        $params = array(
            'election_code' => 'eq.' . $election_code,
        );
        
        return $this->request('voters', 'PATCH', $data, $params);
    }
    
    /**
     * Delete voter
     */
    public function delete_voter($election_code) {
        $params = array(
            'election_code' => 'eq.' . $election_code,
        );
        
        return $this->request('voters', 'DELETE', null, $params);
    }
    
    /**
     * Upsert voter (insert or update)
     */
    public function upsert_voter($data) {
        $headers_extra = array(
            'Prefer' => 'resolution=merge-duplicates,return=representation',
        );
        
        // Use upsert endpoint
        $url = trailingslashit($this->supabase_url) . 'rest/v1/voters';
        
        $headers = array(
            'apikey' => $this->supabase_service_role_key,
            'Authorization' => 'Bearer ' . $this->supabase_service_role_key,
            'Content-Type' => 'application/json',
            'Prefer' => 'resolution=merge-duplicates,return=representation',
        );
        
        $args = array(
            'method' => 'POST',
            'headers' => $headers,
            'timeout' => 30,
            'body' => wp_json_encode($data),
        );
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        
        if ($response_code >= 400) {
            $error_message = isset($decoded['message']) ? $decoded['message'] : 'Unknown error';
            return new WP_Error('supabase_error', $error_message, array('status' => $response_code));
        }
        
        return $decoded;
    }
    
    // ==========================================
    // CANDIDATES CRUD Operations
    // ==========================================
    
    /**
     * Get all candidates
     */
    public function get_candidates($order_by = 'created_at', $ascending = false) {
        $params = array(
            'order' => $order_by . '.' . ($ascending ? 'asc' : 'desc'),
        );
        
        return $this->request('candidates', 'GET', null, $params);
    }
    
    /**
     * Get candidate by ID
     */
    public function get_candidate($id) {
        $params = array(
            'id' => 'eq.' . $id,
        );
        
        $result = $this->request('candidates', 'GET', null, $params);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return !empty($result) ? $result[0] : null;
    }
    
    /**
     * Add a new candidate
     */
    public function add_candidate($data) {
        return $this->request('candidates', 'POST', $data);
    }
    
    /**
     * Update candidate
     */
    public function update_candidate($id, $data) {
        $params = array(
            'id' => 'eq.' . $id,
        );
        
        return $this->request('candidates', 'PATCH', $data, $params);
    }
    
    /**
     * Delete candidate
     */
    public function delete_candidate($id) {
        $params = array(
            'id' => 'eq.' . $id,
        );
        
        return $this->request('candidates', 'DELETE', null, $params);
    }
    
    /**
     * Add default candidates
     */
    public function add_default_candidates() {
        $default_candidates = array(
            array('name' => 'Candidate 1', 'position' => 'President'),
            array('name' => 'Candidate 2', 'position' => 'President'),
        );
        
        $added = 0;
        $skipped = 0;
        
        foreach ($default_candidates as $candidate) {
            // Check if exists
            $params = array(
                'name' => 'eq.' . $candidate['name'],
                'position' => 'eq.' . $candidate['position'],
            );
            
            $existing = $this->request('candidates', 'GET', null, $params);
            
            if (!is_wp_error($existing) && !empty($existing)) {
                $skipped++;
                continue;
            }
            
            $result = $this->add_candidate($candidate);
            
            if (!is_wp_error($result)) {
                $added++;
            }
        }
        
        return array(
            'added' => $added,
            'skipped' => $skipped,
        );
    }
    
    // ==========================================
    // VOTES Operations
    // ==========================================
    
    /**
     * Get all votes with candidate info
     */
    public function get_votes() {
        $params = array(
            'select' => 'candidate_id,candidates(id,name,position)',
        );
        
        return $this->request('votes', 'GET', null, $params);
    }
    
    /**
     * Get vote counts by candidate
     */
    public function get_vote_counts() {
        $votes = $this->get_votes();
        
        if (is_wp_error($votes)) {
            return $votes;
        }
        
        $counts = array();
        
        foreach ($votes as $vote) {
            $candidate_id = $vote['candidate_id'];
            $candidate = is_array($vote['candidates']) && isset($vote['candidates'][0]) 
                ? $vote['candidates'][0] 
                : $vote['candidates'];
            
            if (!isset($counts[$candidate_id])) {
                $counts[$candidate_id] = array(
                    'candidate' => $candidate,
                    'count' => 0,
                );
            }
            
            $counts[$candidate_id]['count']++;
        }
        
        // Sort by count descending
        usort($counts, function($a, $b) {
            return $b['count'] - $a['count'];
        });
        
        return array_values($counts);
    }
    
    /**
     * Get voting statistics
     */
    public function get_statistics() {
        // Get total voters
        $voters = $this->get_voters();
        $total_voters = is_wp_error($voters) ? 0 : count($voters);
        
        // Count voted
        $voted_count = 0;
        if (!is_wp_error($voters)) {
            foreach ($voters as $voter) {
                if (!empty($voter['has_voted'])) {
                    $voted_count++;
                }
            }
        }
        
        $turnout = $total_voters > 0 ? round(($voted_count / $total_voters) * 100, 2) : 0;
        
        return array(
            'total_voters' => $total_voters,
            'votes_cast' => $voted_count,
            'turnout_percentage' => number_format($turnout, 2),
        );
    }
    
    // ==========================================
    // DATABASE Operations
    // ==========================================
    
    /**
     * Reset database (delete all data)
     */
    public function reset_database() {
        $results = array(
            'voters' => false,
            'candidates' => false,
            'votes' => false,
            'sessions' => false,
        );
        
        // Delete votes first (foreign key constraint)
        $votes_result = $this->request('votes', 'DELETE', null, array('id' => 'not.is.null'));
        $results['votes'] = !is_wp_error($votes_result);
        
        // Delete sessions
        $sessions_result = $this->request('sessions', 'DELETE', null, array('id' => 'not.is.null'));
        $results['sessions'] = !is_wp_error($sessions_result);
        
        // Delete voters
        $voters_result = $this->request('voters', 'DELETE', null, array('id' => 'not.is.null'));
        $results['voters'] = !is_wp_error($voters_result);
        
        // Delete candidates
        $candidates_result = $this->request('candidates', 'DELETE', null, array('id' => 'not.is.null'));
        $results['candidates'] = !is_wp_error($candidates_result);
        
        return $results;
    }
}

