<?php
/**
 * Candidates Page
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
        <span class="dashicons dashicons-id"></span>
        <?php esc_html_e('Candidates Management', 'vote-secure-admin'); ?>
    </h1>
    
    <button type="button" id="refresh-candidates-btn" class="page-title-action">
        <span class="dashicons dashicons-update"></span>
        <?php esc_html_e('Refresh', 'vote-secure-admin'); ?>
    </button>
    
    <hr class="wp-header-end">
    
    <div class="vote-secure-two-column">
        <!-- Left Column: Candidates Grid -->
        <div class="vote-secure-main-column">
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-groups"></span>
                        <?php esc_html_e('Candidates List', 'vote-secure-admin'); ?>
                    </h2>
                    <button type="button" id="add-default-candidates-btn" class="button button-secondary">
                        <span class="dashicons dashicons-plus-alt2"></span>
                        <?php esc_html_e('Add Default Candidates', 'vote-secure-admin'); ?>
                    </button>
                </div>
                <div class="vote-secure-card-body">
                    <div id="candidates-loading" class="vote-secure-loading">
                        <span class="spinner is-active"></span>
                        <span><?php esc_html_e('Loading candidates...', 'vote-secure-admin'); ?></span>
                    </div>
                    
                    <div id="candidates-container" style="display: none;">
                        <div id="candidates-grid" class="vote-secure-candidates-grid">
                            <!-- Candidates will be populated via JavaScript -->
                        </div>
                        
                        <div id="no-candidates" class="vote-secure-empty-state" style="display: none;">
                            <span class="dashicons dashicons-info-outline"></span>
                            <p><?php esc_html_e('No candidates found. Add candidates using the form or click "Add Default Candidates".', 'vote-secure-admin'); ?></p>
                        </div>
                    </div>
                    
                    <div id="candidates-error" class="vote-secure-error" style="display: none;">
                        <span class="dashicons dashicons-warning"></span>
                        <span id="candidates-error-message"></span>
                    </div>
                    
                    <div id="default-candidates-result" class="vote-secure-form-result" style="margin-top: 15px;"></div>
                </div>
            </div>
        </div>
        
        <!-- Right Column: Add Candidate Form -->
        <div class="vote-secure-side-column">
            <div class="vote-secure-card">
                <div class="vote-secure-card-header">
                    <h2>
                        <span class="dashicons dashicons-plus-alt"></span>
                        <?php esc_html_e('Add New Candidate', 'vote-secure-admin'); ?>
                    </h2>
                </div>
                <div class="vote-secure-card-body">
                    <form id="add-candidate-form">
                        <p>
                            <label for="candidate-name"><?php esc_html_e('Name', 'vote-secure-admin'); ?> <span class="required">*</span></label>
                            <input type="text" 
                                   id="candidate-name" 
                                   name="name" 
                                   class="widefat" 
                                   required>
                        </p>
                        <p>
                            <label for="candidate-position"><?php esc_html_e('Position', 'vote-secure-admin'); ?> <span class="required">*</span></label>
                            <input type="text" 
                                   id="candidate-position" 
                                   name="position" 
                                   class="widefat" 
                                   placeholder="<?php esc_attr_e('e.g., President', 'vote-secure-admin'); ?>"
                                   required>
                        </p>
                        <p>
                            <label for="candidate-photo-url"><?php esc_html_e('Photo URL', 'vote-secure-admin'); ?></label>
                            <input type="url" 
                                   id="candidate-photo-url" 
                                   name="photo_url" 
                                   class="widefat"
                                   placeholder="https://example.com/photo.jpg">
                        </p>
                        <p>
                            <label for="candidate-description"><?php esc_html_e('Description', 'vote-secure-admin'); ?></label>
                            <textarea id="candidate-description" 
                                      name="description" 
                                      class="widefat" 
                                      rows="4"
                                      placeholder="<?php esc_attr_e('Brief description of the candidate...', 'vote-secure-admin'); ?>"></textarea>
                        </p>
                        <p class="submit">
                            <button type="submit" class="button button-primary">
                                <span class="dashicons dashicons-plus"></span>
                                <?php esc_html_e('Add Candidate', 'vote-secure-admin'); ?>
                            </button>
                            <span class="spinner"></span>
                        </p>
                        <div id="add-candidate-result" class="vote-secure-form-result"></div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/html" id="tmpl-vote-secure-candidate-card">
    <div class="vote-secure-candidate-card">
        <# if (data.photo_url) { #>
            <div class="vote-secure-candidate-photo">
                <img src="{{{ data.photo_url }}}" alt="{{{ data.name }}}">
            </div>
        <# } else { #>
            <div class="vote-secure-candidate-photo vote-secure-candidate-photo-placeholder">
                <span class="dashicons dashicons-admin-users"></span>
            </div>
        <# } #>
        <div class="vote-secure-candidate-info">
            <h3 class="vote-secure-candidate-name">{{{ data.name }}}</h3>
            <span class="vote-secure-candidate-position">{{{ data.position }}}</span>
            <# if (data.description) { #>
                <p class="vote-secure-candidate-description">{{{ data.description }}}</p>
            <# } #>
        </div>
    </div>
</script>

