<?php
/**
 * Settings Page
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

$settings = Vote_Secure_Admin_Pages::get_settings();
?>

<div class="wrap vote-secure-wrap">
    <h1 class="wp-heading-inline">
        <span class="dashicons dashicons-admin-settings"></span>
        <?php esc_html_e('VoteSecure Settings', 'vote-secure-admin'); ?>
    </h1>
    
    <div class="vote-secure-settings-container">
        <form id="vote-secure-settings-form" method="post">
            <?php wp_nonce_field('vote_secure_nonce', 'vote_secure_nonce'); ?>
            
            <!-- Supabase Settings -->
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-database"></span>
                        <?php esc_html_e('Supabase Configuration', 'vote-secure-admin'); ?>
                    </h2>
                    <button type="button" id="test-supabase-btn" class="button button-secondary">
                        <?php esc_html_e('Test Connection', 'vote-secure-admin'); ?>
                    </button>
                </div>
                <div class="vote-secure-card-body">
                    <p class="description">
                        <?php esc_html_e('Enter your Supabase project credentials. You can find these in your Supabase Dashboard under Settings → API.', 'vote-secure-admin'); ?>
                    </p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="supabase_url"><?php esc_html_e('Supabase URL', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <input type="url" 
                                       id="supabase_url" 
                                       name="supabase_url" 
                                       value="<?php echo esc_attr($settings['supabase_url']); ?>" 
                                       class="regular-text"
                                       placeholder="https://your-project.supabase.co">
                                <p class="description"><?php esc_html_e('Your Supabase project URL', 'vote-secure-admin'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="supabase_anon_key"><?php esc_html_e('Anon Key', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <input type="password" 
                                       id="supabase_anon_key" 
                                       name="supabase_anon_key" 
                                       value="<?php echo esc_attr($settings['supabase_anon_key']); ?>" 
                                       class="large-text"
                                       placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                                <p class="description"><?php esc_html_e('Public anonymous key (safe to expose)', 'vote-secure-admin'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="supabase_service_role_key"><?php esc_html_e('Service Role Key', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <input type="password" 
                                       id="supabase_service_role_key" 
                                       name="supabase_service_role_key" 
                                       value="<?php echo esc_attr($settings['supabase_service_role_key']); ?>" 
                                       class="large-text"
                                       placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                                <p class="description">
                                    <strong><?php esc_html_e('Keep this secret!', 'vote-secure-admin'); ?></strong>
                                    <?php esc_html_e('This key has full access to your database.', 'vote-secure-admin'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <div id="supabase-test-result" class="vote-secure-test-result" style="display: none;"></div>
                </div>
            </div>
            
            <!-- Google Sheets Settings -->
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-media-spreadsheet"></span>
                        <?php esc_html_e('Google Sheets Configuration', 'vote-secure-admin'); ?>
                    </h2>
                    <button type="button" id="test-google-sheets-btn" class="button button-secondary">
                        <?php esc_html_e('Test Connection', 'vote-secure-admin'); ?>
                    </button>
                </div>
                <div class="vote-secure-card-body">
                    <p class="description">
                        <?php esc_html_e('Enter your Google Service Account credentials for Sheets API integration. Create a service account in Google Cloud Console and download the JSON key file.', 'vote-secure-admin'); ?>
                    </p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="google_sheets_spreadsheet_id"><?php esc_html_e('Default Spreadsheet ID', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="google_sheets_spreadsheet_id" 
                                       name="google_sheets_spreadsheet_id" 
                                       value="<?php echo esc_attr($settings['google_sheets_spreadsheet_id']); ?>" 
                                       class="regular-text"
                                       placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms">
                                <p class="description"><?php esc_html_e('The ID from your Google Sheets URL (optional)', 'vote-secure-admin'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="google_sheets_client_email"><?php esc_html_e('Service Account Email', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <input type="email" 
                                       id="google_sheets_client_email" 
                                       name="google_sheets_client_email" 
                                       value="<?php echo esc_attr($settings['google_sheets_client_email']); ?>" 
                                       class="large-text"
                                       placeholder="your-service-account@your-project.iam.gserviceaccount.com">
                                <p class="description"><?php esc_html_e('The client_email from your service account JSON key', 'vote-secure-admin'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="google_sheets_private_key"><?php esc_html_e('Private Key', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <textarea id="google_sheets_private_key" 
                                          name="google_sheets_private_key" 
                                          rows="6" 
                                          class="large-text code"
                                          placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"><?php echo esc_textarea($settings['google_sheets_private_key']); ?></textarea>
                                <p class="description">
                                    <strong><?php esc_html_e('Keep this secret!', 'vote-secure-admin'); ?></strong>
                                    <?php esc_html_e('The private_key from your service account JSON key. Include the BEGIN and END lines.', 'vote-secure-admin'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <div id="google-sheets-test-result" class="vote-secure-test-result" style="display: none;"></div>
                </div>
            </div>
            
            <!-- App Settings -->
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-admin-site"></span>
                        <?php esc_html_e('Application Settings', 'vote-secure-admin'); ?>
                    </h2>
                </div>
                <div class="vote-secure-card-body">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="app_url"><?php esc_html_e('Voter Portal URL', 'vote-secure-admin'); ?></label>
                            </th>
                            <td>
                                <input type="url" 
                                       id="app_url" 
                                       name="app_url" 
                                       value="<?php echo esc_attr($settings['app_url']); ?>" 
                                       class="regular-text"
                                       placeholder="https://your-voting-app.vercel.app">
                                <p class="description"><?php esc_html_e('The URL of your voter-facing application (Next.js deployment)', 'vote-secure-admin'); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Save Button -->
            <p class="submit">
                <button type="submit" id="save-settings-btn" class="button button-primary button-large">
                    <span class="dashicons dashicons-saved"></span>
                    <?php esc_html_e('Save Settings', 'vote-secure-admin'); ?>
                </button>
                <span id="save-settings-spinner" class="spinner"></span>
                <span id="save-settings-result" class="vote-secure-inline-result"></span>
            </p>
        </form>
        
        <!-- Danger Zone -->
        <div class="vote-secure-card vote-secure-card-danger">
            <div class="vote-secure-card-header">
                <h2>
                    <span class="dashicons dashicons-warning"></span>
                    <?php esc_html_e('Danger Zone', 'vote-secure-admin'); ?>
                </h2>
            </div>
            <div class="vote-secure-card-body">
                <h3><?php esc_html_e('Reset Database', 'vote-secure-admin'); ?></h3>
                <p class="description">
                    <?php esc_html_e('This will permanently delete all voters, candidates, votes, and sessions from the database. This action cannot be undone!', 'vote-secure-admin'); ?>
                </p>
                
                <div class="vote-secure-reset-form">
                    <input type="text" 
                           id="reset-confirm" 
                           placeholder="<?php esc_attr_e('Type RESET to confirm', 'vote-secure-admin'); ?>"
                           class="regular-text">
                    <button type="button" id="reset-db-btn" class="button button-danger">
                        <span class="dashicons dashicons-trash"></span>
                        <?php esc_html_e('Reset Database', 'vote-secure-admin'); ?>
                    </button>
                </div>
                
                <div id="reset-db-result" class="vote-secure-test-result" style="display: none;"></div>
            </div>
        </div>
    </div>
</div>

