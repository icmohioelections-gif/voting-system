<?php
/**
 * Plugin Name: VoteSecure Admin
 * Plugin URI: https://github.com/icmohioelections-gif/voting-system
 * Description: Admin dashboard for managing voting system - voters, candidates, and results with Supabase integration.
 * Version: 1.0.0
 * Author: ICM Ohio Elections
 * Author URI: https://github.com/icmohioelections-gif
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: vote-secure-admin
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('VOTE_SECURE_VERSION', '1.0.0');
define('VOTE_SECURE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('VOTE_SECURE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VOTE_SECURE_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main plugin class
 */
class Vote_Secure_Admin {
    
    /**
     * Single instance of the class
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
        $this->init();
    }
    
    /**
     * Initialize plugin
     */
    private function init() {
        // Load plugin text domain
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        
        // Include required files
        $this->includes();
        
        // Initialize components
        $this->init_components();
        
        // Hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Include required files
     */
    private function includes() {
        require_once VOTE_SECURE_PLUGIN_DIR . 'includes/class-election-codes.php';
        require_once VOTE_SECURE_PLUGIN_DIR . 'includes/class-supabase-client.php';
        require_once VOTE_SECURE_PLUGIN_DIR . 'includes/class-google-sheets-api.php';
        require_once VOTE_SECURE_PLUGIN_DIR . 'includes/class-database-manager.php';
        require_once VOTE_SECURE_PLUGIN_DIR . 'admin/class-admin-pages.php';
        require_once VOTE_SECURE_PLUGIN_DIR . 'api/class-ajax-handlers.php';
    }
    
    /**
     * Initialize components
     */
    private function init_components() {
        // Initialize AJAX handlers
        Vote_Secure_Ajax_Handlers::get_instance();
        
        // Initialize admin pages
        Vote_Secure_Admin_Pages::get_instance();
    }
    
    /**
     * Load plugin text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'vote-secure-admin',
            false,
            dirname(VOTE_SECURE_PLUGIN_BASENAME) . '/languages'
        );
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        // Main menu
        add_menu_page(
            __('VoteSecure', 'vote-secure-admin'),
            __('VoteSecure', 'vote-secure-admin'),
            'manage_options',
            'vote-secure-admin',
            array($this, 'render_dashboard_page'),
            'dashicons-chart-line',
            30
        );
        
        // Dashboard (Results) - same as main page
        add_submenu_page(
            'vote-secure-admin',
            __('Dashboard', 'vote-secure-admin'),
            __('Dashboard', 'vote-secure-admin'),
            'manage_options',
            'vote-secure-admin',
            array($this, 'render_dashboard_page')
        );
        
        // Voters
        add_submenu_page(
            'vote-secure-admin',
            __('Voters', 'vote-secure-admin'),
            __('Voters', 'vote-secure-admin'),
            'manage_options',
            'vote-secure-voters',
            array($this, 'render_voters_page')
        );
        
        // Candidates
        add_submenu_page(
            'vote-secure-admin',
            __('Candidates', 'vote-secure-admin'),
            __('Candidates', 'vote-secure-admin'),
            'manage_options',
            'vote-secure-candidates',
            array($this, 'render_candidates_page')
        );
        
        // Settings
        add_submenu_page(
            'vote-secure-admin',
            __('Settings', 'vote-secure-admin'),
            __('Settings', 'vote-secure-admin'),
            'manage_options',
            'vote-secure-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Render dashboard page (results)
     */
    public function render_dashboard_page() {
        include VOTE_SECURE_PLUGIN_DIR . 'admin/views/results-page.php';
    }
    
    /**
     * Render voters page
     */
    public function render_voters_page() {
        include VOTE_SECURE_PLUGIN_DIR . 'admin/views/voters-page.php';
    }
    
    /**
     * Render candidates page
     */
    public function render_candidates_page() {
        include VOTE_SECURE_PLUGIN_DIR . 'admin/views/candidates-page.php';
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        include VOTE_SECURE_PLUGIN_DIR . 'admin/views/settings-page.php';
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        // Only load on plugin pages
        if (strpos($hook, 'vote-secure') === false) {
            return;
        }
        
        // Enqueue CSS
        wp_enqueue_style(
            'vote-secure-admin',
            VOTE_SECURE_PLUGIN_URL . 'admin/assets/css/admin.css',
            array(),
            VOTE_SECURE_VERSION
        );
        
        // Enqueue JavaScript
        wp_enqueue_script(
            'vote-secure-admin',
            VOTE_SECURE_PLUGIN_URL . 'admin/assets/js/admin.js',
            array('jquery'),
            VOTE_SECURE_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('vote-secure-admin', 'voteSecure', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('vote_secure_nonce'),
            'i18n' => array(
                'confirmDelete' => __('Are you sure you want to delete this?', 'vote-secure-admin'),
                'confirmReset' => __('Are you sure you want to reset the database? This cannot be undone!', 'vote-secure-admin'),
                'success' => __('Success!', 'vote-secure-admin'),
                'error' => __('Error:', 'vote-secure-admin'),
                'loading' => __('Loading...', 'vote-secure-admin'),
            ),
        ));
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('vote_secure_settings', 'vote_secure_settings', array(
            'sanitize_callback' => array($this, 'sanitize_settings'),
        ));
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        if (isset($input['supabase_url'])) {
            $sanitized['supabase_url'] = esc_url_raw($input['supabase_url']);
        }
        
        if (isset($input['supabase_anon_key'])) {
            $sanitized['supabase_anon_key'] = sanitize_text_field($input['supabase_anon_key']);
        }
        
        if (isset($input['supabase_service_role_key'])) {
            $sanitized['supabase_service_role_key'] = sanitize_text_field($input['supabase_service_role_key']);
        }
        
        if (isset($input['google_sheets_spreadsheet_id'])) {
            $sanitized['google_sheets_spreadsheet_id'] = sanitize_text_field($input['google_sheets_spreadsheet_id']);
        }
        
        if (isset($input['google_sheets_client_email'])) {
            $sanitized['google_sheets_client_email'] = sanitize_email($input['google_sheets_client_email']);
        }
        
        if (isset($input['google_sheets_private_key'])) {
            $sanitized['google_sheets_private_key'] = sanitize_textarea_field($input['google_sheets_private_key']);
        }
        
        if (isset($input['app_url'])) {
            $sanitized['app_url'] = esc_url_raw($input['app_url']);
        }
        
        return $sanitized;
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options if not exist
        $default_settings = array(
            'supabase_url' => '',
            'supabase_anon_key' => '',
            'supabase_service_role_key' => '',
            'google_sheets_spreadsheet_id' => '',
            'google_sheets_client_email' => '',
            'google_sheets_private_key' => '',
            'app_url' => '',
        );
        
        if (!get_option('vote_secure_settings')) {
            add_option('vote_secure_settings', $default_settings);
        }
        
        // Flush rewrite rules if needed
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Cleanup if needed
        flush_rewrite_rules();
    }
}

/**
 * Initialize plugin
 */
function vote_secure_admin_init() {
    return Vote_Secure_Admin::get_instance();
}

// Start the plugin
vote_secure_admin_init();

