<?php
/**
 * Voters Table Partial
 *
 * @package VoteSecure
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Render a single voter row
 *
 * @param array $voter Voter data
 */
function vote_secure_render_voter_row($voter) {
    $full_name = !empty($voter['last_name']) 
        ? $voter['first_name'] . ' ' . $voter['last_name'] 
        : $voter['first_name'];
    ?>
    <tr>
        <td class="column-election-code"><?php echo esc_html($voter['election_code']); ?></td>
        <td class="column-name"><?php echo esc_html($full_name); ?></td>
        <td class="column-vote-status">
            <?php echo Vote_Secure_Admin_Pages::get_vote_status_badge(!empty($voter['has_voted'])); ?>
        </td>
        <td class="column-login-status">
            <?php echo Vote_Secure_Admin_Pages::get_login_status_badge(!empty($voter['is_logged_in'])); ?>
        </td>
        <td class="column-voted-at">
            <?php echo esc_html(Vote_Secure_Admin_Pages::format_date($voter['voted_at'] ?? '')); ?>
        </td>
    </tr>
    <?php
}

