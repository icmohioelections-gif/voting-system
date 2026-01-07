<?php
/**
 * Voters Page
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Check if configured
Vote_Secure_Admin_Pages::render_config_notice();
?>

<div class="wrap vote-secure-wrap">
    <h1 class="wp-heading-inline">
        <span class="dashicons dashicons-admin-users"></span>
        <?php esc_html_e('Voters Management', 'vote-secure-admin'); ?>
    </h1>
    
    <button type="button" id="refresh-voters-btn" class="page-title-action">
        <span class="dashicons dashicons-update"></span>
        <?php esc_html_e('Refresh', 'vote-secure-admin'); ?>
    </button>
    
    <hr class="wp-header-end">
    
    <div class="vote-secure-two-column">
        <!-- Left Column: Voters Table -->
        <div class="vote-secure-main-column">
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-list-view"></span>
                        <?php esc_html_e('Voters List', 'vote-secure-admin'); ?>
                    </h2>
                    <div class="vote-secure-table-controls">
                        <input type="search" 
                               id="voters-search" 
                               class="vote-secure-search" 
                               placeholder="<?php esc_attr_e('Search voters...', 'vote-secure-admin'); ?>">
                    </div>
                </div>
                <div class="vote-secure-card-body">
                    <div id="voters-loading" class="vote-secure-loading">
                        <span class="spinner is-active"></span>
                        <span><?php esc_html_e('Loading voters...', 'vote-secure-admin'); ?></span>
                    </div>
                    
                    <div id="voters-container" style="display: none;">
                        <table class="wp-list-table widefat fixed striped vote-secure-table" id="voters-table">
                            <thead>
                                <tr>
                                    <th class="column-election-code"><?php esc_html_e('Election Code', 'vote-secure-admin'); ?></th>
                                    <th class="column-name"><?php esc_html_e('Name', 'vote-secure-admin'); ?></th>
                                    <th class="column-vote-status"><?php esc_html_e('Vote Status', 'vote-secure-admin'); ?></th>
                                    <th class="column-login-status"><?php esc_html_e('Login Status', 'vote-secure-admin'); ?></th>
                                    <th class="column-voted-at"><?php esc_html_e('Voted At', 'vote-secure-admin'); ?></th>
                                </tr>
                            </thead>
                            <tbody id="voters-tbody">
                                <!-- Voters will be populated via JavaScript -->
                            </tbody>
                        </table>
                        
                        <div id="voters-pagination" class="vote-secure-pagination"></div>
                        
                        <div id="no-voters" class="vote-secure-empty-state" style="display: none;">
                            <span class="dashicons dashicons-info-outline"></span>
                            <p><?php esc_html_e('No voters found. Add voters using the form or import from CSV/Google Sheets.', 'vote-secure-admin'); ?></p>
                        </div>
                    </div>
                    
                    <div id="voters-error" class="vote-secure-error" style="display: none;">
                        <span class="dashicons dashicons-warning"></span>
                        <span id="voters-error-message"></span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Column: Forms -->
        <div class="vote-secure-side-column">
            <!-- Add Voter Form -->
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-plus-alt"></span>
                        <?php esc_html_e('Add New Voter', 'vote-secure-admin'); ?>
                    </h2>
                </div>
                <div class="vote-secure-card-body">
                    <form id="add-voter-form">
                        <p>
                            <label for="voter-first-name"><?php esc_html_e('First Name', 'vote-secure-admin'); ?> <span class="required">*</span></label>
                            <input type="text" 
                                   id="voter-first-name" 
                                   name="first_name" 
                                   class="widefat" 
                                   required>
                        </p>
                        <p>
                            <label for="voter-last-name"><?php esc_html_e('Last Name', 'vote-secure-admin'); ?></label>
                            <input type="text" 
                                   id="voter-last-name" 
                                   name="last_name" 
                                   class="widefat">
                        </p>
                        <p>
                            <label for="voter-election-code"><?php esc_html_e('Election Code', 'vote-secure-admin'); ?> <span class="required">*</span></label>
                            <input type="text" 
                                   id="voter-election-code" 
                                   name="election_code" 
                                   class="widefat" 
                                   maxlength="10"
                                   pattern="[A-Za-z0-9]{10}"
                                   required>
                            <span class="description"><?php esc_html_e('10 alphanumeric characters', 'vote-secure-admin'); ?></span>
                            <button type="button" id="generate-code-btn" class="button button-small">
                                <?php esc_html_e('Generate', 'vote-secure-admin'); ?>
                            </button>
                        </p>
                        <p class="submit">
                            <button type="submit" class="button button-primary">
                                <span class="dashicons dashicons-plus"></span>
                                <?php esc_html_e('Add Voter', 'vote-secure-admin'); ?>
                            </button>
                            <span class="spinner"></span>
                        </p>
                        <div id="add-voter-result" class="vote-secure-form-result"></div>
                    </form>
                </div>
            </div>
            
            <!-- CSV Upload -->
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-upload"></span>
                        <?php esc_html_e('Import from CSV', 'vote-secure-admin'); ?>
                    </h2>
                </div>
                <div class="vote-secure-card-body">
                    <form id="csv-upload-form" enctype="multipart/form-data">
                        <p>
                            <label for="csv-file"><?php esc_html_e('CSV File', 'vote-secure-admin'); ?></label>
                            <input type="file" 
                                   id="csv-file" 
                                   name="csv_file" 
                                   accept=".csv"
                                   class="widefat">
                        </p>
                        <p class="description">
                            <?php esc_html_e('Supported formats:', 'vote-secure-admin'); ?><br>
                            <code>election_code, first_name, last_name</code><br>
                            <?php esc_html_e('or just', 'vote-secure-admin'); ?> <code>full_name</code>
                        </p>
                        <p class="submit">
                            <button type="submit" class="button button-secondary">
                                <span class="dashicons dashicons-upload"></span>
                                <?php esc_html_e('Upload CSV', 'vote-secure-admin'); ?>
                            </button>
                            <span class="spinner"></span>
                        </p>
                        <div id="csv-upload-result" class="vote-secure-form-result"></div>
                    </form>
                </div>
            </div>
            
            <!-- Google Sheets Sync -->
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-media-spreadsheet"></span>
                        <?php esc_html_e('Sync from Google Sheets', 'vote-secure-admin'); ?>
                    </h2>
                </div>
                <div class="vote-secure-card-body">
                    <form id="sheets-sync-form">
                        <p>
                            <label for="sheet-url"><?php esc_html_e('Google Sheets URL', 'vote-secure-admin'); ?></label>
                            <input type="url" 
                                   id="sheet-url" 
                                   name="sheet_url" 
                                   class="widefat"
                                   placeholder="https://docs.google.com/spreadsheets/d/...">
                        </p>
                        <p class="description">
                            <?php esc_html_e('Make sure the sheet is shared with your service account email.', 'vote-secure-admin'); ?>
                        </p>
                        <p class="submit">
                            <button type="submit" class="button button-secondary">
                                <span class="dashicons dashicons-update"></span>
                                <?php esc_html_e('Sync from Sheet', 'vote-secure-admin'); ?>
                            </button>
                            <span class="spinner"></span>
                        </p>
                        <div id="sheets-sync-result" class="vote-secure-form-result"></div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

