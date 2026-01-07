<?php
/**
 * Database Manager
 *
 * Abstraction layer for database operations to support future WordPress DB migration
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Vote_Secure_Database_Manager
 * 
 * Manages database operations with abstraction for multiple backends
 */
class Vote_Secure_Database_Manager {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * Current database mode
     */
    private $mode = 'supabase';
    
    /**
     * Supabase client instance
     */
    private $supabase;
    
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
        $this->supabase = Vote_Secure_Supabase_Client::get_instance();
        
        // Get mode from settings (default to supabase)
        $settings = get_option('vote_secure_settings', array());
        $this->mode = isset($settings['database_mode']) ? $settings['database_mode'] : 'supabase';
    }
    
    /**
     * Get current mode
     */
    public function get_mode() {
        return $this->mode;
    }
    
    /**
     * Set mode
     */
    public function set_mode($mode) {
        $this->mode = $mode;
    }
    
    /**
     * Check if database is configured
     */
    public function is_configured() {
        if ($this->mode === 'supabase') {
            return $this->supabase->is_configured();
        }
        
        // WordPress mode - always configured
        return true;
    }
    
    // ==========================================
    // VOTERS Operations
    // ==========================================
    
    /**
     * Get all voters
     */
    public function get_voters() {
        if ($this->mode === 'supabase') {
            return $this->supabase->get_voters();
        }
        
        // WordPress mode - future implementation
        return $this->get_voters_wp();
    }
    
    /**
     * Get voters from WordPress DB (future)
     */
    private function get_voters_wp() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_voters';
        
        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return new WP_Error('table_not_found', __('Voters table not found.', 'vote-secure-admin'));
        }
        
        $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC", ARRAY_A);
        
        return $results ?: array();
    }
    
    /**
     * Get voter by election code
     */
    public function get_voter_by_code($election_code) {
        if ($this->mode === 'supabase') {
            return $this->supabase->get_voter_by_code($election_code);
        }
        
        return $this->get_voter_by_code_wp($election_code);
    }
    
    /**
     * Get voter from WordPress DB (future)
     */
    private function get_voter_by_code_wp($election_code) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_voters';
        
        $result = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE election_code = %s", $election_code),
            ARRAY_A
        );
        
        return $result;
    }
    
    /**
     * Add voter
     */
    public function add_voter($data) {
        if ($this->mode === 'supabase') {
            return $this->supabase->add_voter($data);
        }
        
        return $this->add_voter_wp($data);
    }
    
    /**
     * Add voter to WordPress DB (future)
     */
    private function add_voter_wp($data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_voters';
        
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        $result = $wpdb->insert($table_name, $data);
        
        if ($result === false) {
            return new WP_Error('insert_failed', $wpdb->last_error);
        }
        
        $data['id'] = $wpdb->insert_id;
        return array($data);
    }
    
    /**
     * Update voter
     */
    public function update_voter($election_code, $data) {
        if ($this->mode === 'supabase') {
            return $this->supabase->update_voter($election_code, $data);
        }
        
        return $this->update_voter_wp($election_code, $data);
    }
    
    /**
     * Update voter in WordPress DB (future)
     */
    private function update_voter_wp($election_code, $data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_voters';
        
        $data['updated_at'] = current_time('mysql');
        
        $result = $wpdb->update(
            $table_name,
            $data,
            array('election_code' => $election_code)
        );
        
        if ($result === false) {
            return new WP_Error('update_failed', $wpdb->last_error);
        }
        
        return array('success' => true);
    }
    
    /**
     * Upsert voter
     */
    public function upsert_voter($data) {
        if ($this->mode === 'supabase') {
            return $this->supabase->upsert_voter($data);
        }
        
        // WordPress mode - check if exists then insert or update
        $existing = $this->get_voter_by_code($data['election_code']);
        
        if ($existing) {
            return $this->update_voter($data['election_code'], $data);
        }
        
        return $this->add_voter($data);
    }
    
    // ==========================================
    // CANDIDATES Operations
    // ==========================================
    
    /**
     * Get all candidates
     */
    public function get_candidates() {
        if ($this->mode === 'supabase') {
            return $this->supabase->get_candidates();
        }
        
        return $this->get_candidates_wp();
    }
    
    /**
     * Get candidates from WordPress DB (future)
     */
    private function get_candidates_wp() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_candidates';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") !== $table_name) {
            return new WP_Error('table_not_found', __('Candidates table not found.', 'vote-secure-admin'));
        }
        
        $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC", ARRAY_A);
        
        return $results ?: array();
    }
    
    /**
     * Add candidate
     */
    public function add_candidate($data) {
        if ($this->mode === 'supabase') {
            return $this->supabase->add_candidate($data);
        }
        
        return $this->add_candidate_wp($data);
    }
    
    /**
     * Add candidate to WordPress DB (future)
     */
    private function add_candidate_wp($data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_candidates';
        
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        $result = $wpdb->insert($table_name, $data);
        
        if ($result === false) {
            return new WP_Error('insert_failed', $wpdb->last_error);
        }
        
        $data['id'] = $wpdb->insert_id;
        return array($data);
    }
    
    /**
     * Add default candidates
     */
    public function add_default_candidates() {
        if ($this->mode === 'supabase') {
            return $this->supabase->add_default_candidates();
        }
        
        // WordPress mode
        $default_candidates = array(
            array('name' => 'Candidate 1', 'position' => 'President'),
            array('name' => 'Candidate 2', 'position' => 'President'),
        );
        
        $added = 0;
        $skipped = 0;
        
        foreach ($default_candidates as $candidate) {
            $existing = $this->get_candidate_by_name_position($candidate['name'], $candidate['position']);
            
            if ($existing) {
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
    
    /**
     * Get candidate by name and position (WordPress mode)
     */
    private function get_candidate_by_name_position($name, $position) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_candidates';
        
        return $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE name = %s AND position = %s",
                $name,
                $position
            ),
            ARRAY_A
        );
    }
    
    // ==========================================
    // VOTES & STATISTICS Operations
    // ==========================================
    
    /**
     * Get vote counts
     */
    public function get_vote_counts() {
        if ($this->mode === 'supabase') {
            return $this->supabase->get_vote_counts();
        }
        
        return $this->get_vote_counts_wp();
    }
    
    /**
     * Get vote counts from WordPress DB (future)
     */
    private function get_vote_counts_wp() {
        global $wpdb;
        $votes_table = $wpdb->prefix . 'vote_secure_votes';
        $candidates_table = $wpdb->prefix . 'vote_secure_candidates';
        
        $results = $wpdb->get_results("
            SELECT c.id, c.name, c.position, COUNT(v.id) as count
            FROM $candidates_table c
            LEFT JOIN $votes_table v ON c.id = v.candidate_id
            GROUP BY c.id
            ORDER BY count DESC
        ", ARRAY_A);
        
        $counts = array();
        foreach ($results as $row) {
            $counts[] = array(
                'candidate' => array(
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'position' => $row['position'],
                ),
                'count' => (int) $row['count'],
            );
        }
        
        return $counts;
    }
    
    /**
     * Get statistics
     */
    public function get_statistics() {
        if ($this->mode === 'supabase') {
            return $this->supabase->get_statistics();
        }
        
        return $this->get_statistics_wp();
    }
    
    /**
     * Get statistics from WordPress DB (future)
     */
    private function get_statistics_wp() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'vote_secure_voters';
        
        $total = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        $voted = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE has_voted = 1");
        
        $total = (int) $total;
        $voted = (int) $voted;
        $turnout = $total > 0 ? round(($voted / $total) * 100, 2) : 0;
        
        return array(
            'total_voters' => $total,
            'votes_cast' => $voted,
            'turnout_percentage' => number_format($turnout, 2),
        );
    }
    
    // ==========================================
    // DATABASE Operations
    // ==========================================
    
    /**
     * Reset database
     */
    public function reset_database() {
        if ($this->mode === 'supabase') {
            return $this->supabase->reset_database();
        }
        
        return $this->reset_database_wp();
    }
    
    /**
     * Reset WordPress database tables (future)
     */
    private function reset_database_wp() {
        global $wpdb;
        
        $tables = array(
            'vote_secure_votes',
            'vote_secure_sessions',
            'vote_secure_voters',
            'vote_secure_candidates',
        );
        
        $results = array();
        
        foreach ($tables as $table) {
            $table_name = $wpdb->prefix . $table;
            $wpdb->query("TRUNCATE TABLE $table_name");
            $results[$table] = true;
        }
        
        return $results;
    }
    
    /**
     * Create WordPress tables (for future migration)
     */
    public function create_wp_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Voters table
        $voters_table = $wpdb->prefix . 'vote_secure_voters';
        $sql_voters = "CREATE TABLE $voters_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            election_code varchar(20) NOT NULL UNIQUE,
            first_name varchar(100) NOT NULL,
            last_name varchar(100),
            has_voted tinyint(1) DEFAULT 0,
            voted_at datetime,
            voting_start_date datetime,
            is_logged_in tinyint(1) DEFAULT 0,
            last_login datetime,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY election_code (election_code)
        ) $charset_collate;";
        
        dbDelta($sql_voters);
        
        // Candidates table
        $candidates_table = $wpdb->prefix . 'vote_secure_candidates';
        $sql_candidates = "CREATE TABLE $candidates_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            name varchar(200) NOT NULL,
            position varchar(100) NOT NULL,
            photo_url text,
            description text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        dbDelta($sql_candidates);
        
        // Votes table
        $votes_table = $wpdb->prefix . 'vote_secure_votes';
        $sql_votes = "CREATE TABLE $votes_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            voter_id bigint(20) UNSIGNED NOT NULL,
            candidate_id bigint(20) UNSIGNED NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY voter_id (voter_id),
            KEY candidate_id (candidate_id)
        ) $charset_collate;";
        
        dbDelta($sql_votes);
        
        // Sessions table
        $sessions_table = $wpdb->prefix . 'vote_secure_sessions';
        $sql_sessions = "CREATE TABLE $sessions_table (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            voter_id bigint(20) UNSIGNED NOT NULL,
            session_token varchar(255) NOT NULL UNIQUE,
            election_code varchar(20) NOT NULL,
            expires_at datetime NOT NULL,
            last_activity datetime DEFAULT CURRENT_TIMESTAMP,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY voter_id (voter_id),
            KEY session_token (session_token)
        ) $charset_collate;";
        
        dbDelta($sql_sessions);
        
        return true;
    }
}

