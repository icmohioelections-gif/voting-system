<?php
/**
 * Candidate Card Partial
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Render a candidate card
 *
 * @param array $candidate Candidate data
 */
function vote_secure_render_candidate_card($candidate) {
    ?>
    <div class="vote-secure-candidate-card">
        <?php if (!empty($candidate['photo_url'])) : ?>
            <div class="vote-secure-candidate-photo">
                <img src="<?php echo esc_url($candidate['photo_url']); ?>" alt="<?php echo esc_attr($candidate['name']); ?>">
            </div>
        <?php else : ?>
            <div class="vote-secure-candidate-photo vote-secure-candidate-photo-placeholder">
                <span class="dashicons dashicons-admin-users"></span>
            </div>
        <?php endif; ?>
        <div class="vote-secure-candidate-info">
            <h3 class="vote-secure-candidate-name"><?php echo esc_html($candidate['name']); ?></h3>
            <span class="vote-secure-candidate-position"><?php echo esc_html($candidate['position']); ?></span>
            <?php if (!empty($candidate['description'])) : ?>
                <p class="vote-secure-candidate-description"><?php echo esc_html($candidate['description']); ?></p>
            <?php endif; ?>
        </div>
    </div>
    <?php
}

