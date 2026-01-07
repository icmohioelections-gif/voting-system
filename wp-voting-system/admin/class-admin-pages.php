<?php
/**
 * Admin Pages Handler
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Vote_Secure_Admin_Pages
 * 
 * Handles admin page rendering and logic
 */
class Vote_Secure_Admin_Pages {
    
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
        // Nothing to initialize here
    }
    
    /**
     * Get settings
     */
    public static function get_settings() {
        return get_option('vote_secure_settings', array(
            'supabase_url' => '',
            'supabase_anon_key' => '',
            'supabase_service_role_key' => '',
            'google_sheets_spreadsheet_id' => '',
            'google_sheets_client_email' => '',
            'google_sheets_private_key' => '',
            'app_url' => '',
        ));
    }
    
    /**
     * Check if Supabase is configured
     */
    public static function is_supabase_configured() {
        $settings = self::get_settings();
        return !empty($settings['supabase_url']) && !empty($settings['supabase_service_role_key']);
    }
    
    /**
     * Check if Google Sheets is configured
     */
    public static function is_google_sheets_configured() {
        $settings = self::get_settings();
        return !empty($settings['google_sheets_client_email']) && !empty($settings['google_sheets_private_key']);
    }
    
    /**
     * Render notice for unconfigured settings
     */
    public static function render_config_notice() {
        if (!self::is_supabase_configured()) {
            ?>
            <div class="notice notice-warning">
                <p>
                    <strong><?php esc_html_e('VoteSecure:', 'vote-secure-admin'); ?></strong>
                    <?php esc_html_e('Supabase credentials are not configured.', 'vote-secure-admin'); ?>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=vote-secure-settings')); ?>">
                        <?php esc_html_e('Configure now', 'vote-secure-admin'); ?>
                    </a>
                </p>
            </div>
            <?php
        }
    }
    
    /**
     * Format date for display
     */
    public static function format_date($date_string) {
        if (empty($date_string)) {
            return '—';
        }
        
        $timestamp = strtotime($date_string);
        return date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $timestamp);
    }
    
    /**
     * Get vote status badge HTML
     */
    public static function get_vote_status_badge($has_voted) {
        if ($has_voted) {
            return '<span class="vote-secure-badge vote-secure-badge-success">' . esc_html__('Voted', 'vote-secure-admin') . '</span>';
        }
        return '<span class="vote-secure-badge vote-secure-badge-pending">' . esc_html__('Not Voted', 'vote-secure-admin') . '</span>';
    }
    
    /**
     * Get login status badge HTML
     */
    public static function get_login_status_badge($is_logged_in) {
        if ($is_logged_in) {
            return '<span class="vote-secure-badge vote-secure-badge-info">' . esc_html__('Online', 'vote-secure-admin') . '</span>';
        }
        return '<span class="vote-secure-badge vote-secure-badge-secondary">' . esc_html__('Offline', 'vote-secure-admin') . '</span>';
    }
}

