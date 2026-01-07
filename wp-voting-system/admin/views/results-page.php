<?php
/**
 * Results Page (Dashboard)
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
        <span class="dashicons dashicons-chart-line"></span>
        <?php esc_html_e('VoteSecure Dashboard', 'vote-secure-admin'); ?>
    </h1>
    
    <button type="button" id="refresh-results-btn" class="page-title-action">
        <span class="dashicons dashicons-update"></span>
        <?php esc_html_e('Refresh', 'vote-secure-admin'); ?>
    </button>
    
    <hr class="wp-header-end">
    
    <!-- Statistics Cards -->
    <div class="vote-secure-stats-grid" id="statistics-container">
        <div class="vote-secure-stat-card">
            <div class="vote-secure-stat-icon">
                <span class="dashicons dashicons-groups"></span>
            </div>
            <div class="vote-secure-stat-content">
                <span class="vote-secure-stat-value" id="stat-total-voters">—</span>
                <span class="vote-secure-stat-label"><?php esc_html_e('Total Voters', 'vote-secure-admin'); ?></span>
            </div>
        </div>
        
        <div class="vote-secure-stat-card">
            <div class="vote-secure-stat-icon vote-secure-stat-icon-success">
                <span class="dashicons dashicons-yes-alt"></span>
            </div>
            <div class="vote-secure-stat-content">
                <span class="vote-secure-stat-value" id="stat-votes-cast">—</span>
                <span class="vote-secure-stat-label"><?php esc_html_e('Votes Cast', 'vote-secure-admin'); ?></span>
            </div>
        </div>
        
        <div class="vote-secure-stat-card">
            <div class="vote-secure-stat-icon vote-secure-stat-icon-info">
                <span class="dashicons dashicons-chart-pie"></span>
            </div>
            <div class="vote-secure-stat-content">
                <span class="vote-secure-stat-value" id="stat-turnout">—%</span>
                <span class="vote-secure-stat-label"><?php esc_html_e('Voter Turnout', 'vote-secure-admin'); ?></span>
            </div>
        </div>
    </div>
    
    <!-- Results Section -->
    <div class="vote-secure-card">
        <div class="vote-secure-card-header">
            <h2>
                <span class="dashicons dashicons-chart-bar"></span>
                <?php esc_html_e('Live Vote Counts', 'vote-secure-admin'); ?>
            </h2>
        </div>
        <div class="vote-secure-card-body">
            <div id="results-loading" class="vote-secure-loading">
                <span class="spinner is-active"></span>
                <span><?php esc_html_e('Loading results...', 'vote-secure-admin'); ?></span>
            </div>
            
            <div id="results-container" style="display: none;">
                <div id="results-list" class="vote-secure-results-list">
                    <!-- Results will be populated via JavaScript -->
                </div>
                
                <div id="no-results" class="vote-secure-empty-state" style="display: none;">
                    <span class="dashicons dashicons-info-outline"></span>
                    <p><?php esc_html_e('No votes have been cast yet.', 'vote-secure-admin'); ?></p>
                </div>
            </div>
            
            <div id="results-error" class="vote-secure-error" style="display: none;">
                <span class="dashicons dashicons-warning"></span>
                <span id="results-error-message"></span>
            </div>
        </div>
    </div>
    
    <!-- Quick Links -->
    <div class="vote-secure-quick-links">
        <a href="<?php echo esc_url(admin_url('admin.php?page=vote-secure-voters')); ?>" class="vote-secure-quick-link">
            <span class="dashicons dashicons-admin-users"></span>
            <?php esc_html_e('Manage Voters', 'vote-secure-admin'); ?>
        </a>
        <a href="<?php echo esc_url(admin_url('admin.php?page=vote-secure-candidates')); ?>" class="vote-secure-quick-link">
            <span class="dashicons dashicons-id"></span>
            <?php esc_html_e('Manage Candidates', 'vote-secure-admin'); ?>
        </a>
        <a href="<?php echo esc_url(admin_url('admin.php?page=vote-secure-settings')); ?>" class="vote-secure-quick-link">
            <span class="dashicons dashicons-admin-settings"></span>
            <?php esc_html_e('Settings', 'vote-secure-admin'); ?>
        </a>
    </div>
</div>

<script type="text/html" id="tmpl-vote-secure-result-item">
    <div class="vote-secure-result-item">
        <div class="vote-secure-result-header">
            <div class="vote-secure-result-candidate">
                <span class="vote-secure-result-rank">#{{{ data.rank }}}</span>
                <div class="vote-secure-result-info">
                    <strong class="vote-secure-result-name">{{{ data.name }}}</strong>
                    <span class="vote-secure-result-position">{{{ data.position }}}</span>
                </div>
            </div>
            <div class="vote-secure-result-count">
                <span class="vote-secure-result-votes">{{{ data.count }}}</span>
                <span class="vote-secure-result-label"><?php esc_html_e('votes', 'vote-secure-admin'); ?></span>
            </div>
        </div>
        <div class="vote-secure-result-bar-container">
            <div class="vote-secure-result-bar" style="width: {{{ data.percentage }}}%;"></div>
        </div>
        <div class="vote-secure-result-percentage">{{{ data.percentage }}}%</div>
    </div>
</script>

