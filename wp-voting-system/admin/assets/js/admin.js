/**
 * VoteSecure Admin JavaScript
 *
 * @package VoteSecure
 */

(function($) {
    'use strict';

    // ========================================
    // Utility Functions
    // ========================================
    
    /**
     * Show result message
     */
    function showResult($container, message, type) {
        $container
            .removeClass('success error')
            .addClass(type)
            .html(message)
            .show();
    }

    /**
     * Hide result message
     */
    function hideResult($container) {
        $container.hide().removeClass('success error').html('');
    }

    /**
     * Format date
     */
    function formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    /**
     * Get vote status badge
     */
    function getVoteStatusBadge(hasVoted) {
        if (hasVoted) {
            return '<span class="vote-secure-badge vote-secure-badge-success">Voted</span>';
        }
        return '<span class="vote-secure-badge vote-secure-badge-pending">Not Voted</span>';
    }

    /**
     * Get login status badge
     */
    function getLoginStatusBadge(isLoggedIn) {
        if (isLoggedIn) {
            return '<span class="vote-secure-badge vote-secure-badge-info">Online</span>';
        }
        return '<span class="vote-secure-badge vote-secure-badge-secondary">Offline</span>';
    }

    /**
     * Generate election code
     */
    function generateElectionCode(name) {
        // Remove non-letters and convert to uppercase
        const cleanName = (name || 'VOTER').replace(/[^a-zA-Z]/g, '').toUpperCase();
        const namePart = (cleanName + 'XXXXX').substring(0, 5);
        
        // Generate 4 random numbers
        let numPart = '';
        for (let i = 0; i < 4; i++) {
            numPart += Math.floor(Math.random() * 10);
        }
        
        // Generate 1 random letter
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letterPart = alphabet.charAt(Math.floor(Math.random() * 26));
        
        return namePart + numPart + letterPart;
    }

    // ========================================
    // Results Page
    // ========================================
    
    function loadResults() {
        const $loading = $('#results-loading');
        const $container = $('#results-container');
        const $error = $('#results-error');
        const $list = $('#results-list');
        const $noResults = $('#no-results');

        $loading.show();
        $container.hide();
        $error.hide();

        $.ajax({
            url: voteSecure.ajaxUrl,
            type: 'POST',
            data: {
                action: 'vote_secure_fetch_results',
                nonce: voteSecure.nonce
            },
            success: function(response) {
                $loading.hide();
                
                if (response.success) {
                    const data = response.data;
                    
                    // Update statistics
                    $('#stat-total-voters').text(data.statistics.total_voters);
                    $('#stat-votes-cast').text(data.statistics.votes_cast);
                    $('#stat-turnout').text(data.statistics.turnout_percentage + '%');
                    
                    // Update results
                    if (data.results && data.results.length > 0) {
                        const totalVotes = data.results.reduce((sum, r) => sum + r.count, 0);
                        
                        let html = '';
                        data.results.forEach(function(result, index) {
                            const percentage = totalVotes > 0 
                                ? ((result.count / totalVotes) * 100).toFixed(1) 
                                : 0;
                            
                            html += `
                                <div class="vote-secure-result-item">
                                    <div class="vote-secure-result-header">
                                        <div class="vote-secure-result-candidate">
                                            <span class="vote-secure-result-rank">#${index + 1}</span>
                                            <div class="vote-secure-result-info">
                                                <strong class="vote-secure-result-name">${result.candidate.name}</strong>
                                                <span class="vote-secure-result-position">${result.candidate.position}</span>
                                            </div>
                                        </div>
                                        <div class="vote-secure-result-count">
                                            <span class="vote-secure-result-votes">${result.count}</span>
                                            <span class="vote-secure-result-label">votes</span>
                                        </div>
                                    </div>
                                    <div class="vote-secure-result-bar-container">
                                        <div class="vote-secure-result-bar" style="width: ${percentage}%;"></div>
                                    </div>
                                    <div class="vote-secure-result-percentage">${percentage}%</div>
                                </div>
                            `;
                        });
                        
                        $list.html(html);
                        $noResults.hide();
                    } else {
                        $list.html('');
                        $noResults.show();
                    }
                    
                    $container.show();
                } else {
                    $('#results-error-message').text(response.data.message);
                    $error.show();
                }
            },
            error: function() {
                $loading.hide();
                $('#results-error-message').text('Failed to load results. Please try again.');
                $error.show();
            }
        });
    }

    // ========================================
    // Voters Page
    // ========================================
    
    let allVoters = [];
    
    function loadVoters() {
        const $loading = $('#voters-loading');
        const $container = $('#voters-container');
        const $error = $('#voters-error');

        $loading.show();
        $container.hide();
        $error.hide();

        $.ajax({
            url: voteSecure.ajaxUrl,
            type: 'POST',
            data: {
                action: 'vote_secure_fetch_voters',
                nonce: voteSecure.nonce
            },
            success: function(response) {
                $loading.hide();
                
                if (response.success) {
                    allVoters = response.data.voters || [];
                    renderVoters(allVoters);
                    $container.show();
                } else {
                    $('#voters-error-message').text(response.data.message);
                    $error.show();
                }
            },
            error: function() {
                $loading.hide();
                $('#voters-error-message').text('Failed to load voters. Please try again.');
                $error.show();
            }
        });
    }

    function renderVoters(voters) {
        const $tbody = $('#voters-tbody');
        const $noVoters = $('#no-voters');

        if (voters.length === 0) {
            $tbody.html('');
            $noVoters.show();
            return;
        }

        $noVoters.hide();
        
        let html = '';
        voters.forEach(function(voter) {
            const fullName = voter.last_name 
                ? `${voter.first_name} ${voter.last_name}` 
                : voter.first_name;
            
            html += `
                <tr>
                    <td class="column-election-code">${voter.election_code}</td>
                    <td class="column-name">${fullName}</td>
                    <td class="column-vote-status">${getVoteStatusBadge(voter.has_voted)}</td>
                    <td class="column-login-status">${getLoginStatusBadge(voter.is_logged_in)}</td>
                    <td class="column-voted-at">${formatDate(voter.voted_at)}</td>
                </tr>
            `;
        });
        
        $tbody.html(html);
    }

    function filterVoters(searchTerm) {
        if (!searchTerm) {
            renderVoters(allVoters);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = allVoters.filter(function(voter) {
            const fullName = (voter.first_name + ' ' + (voter.last_name || '')).toLowerCase();
            return fullName.includes(term) || voter.election_code.toLowerCase().includes(term);
        });
        
        renderVoters(filtered);
    }

    // ========================================
    // Candidates Page
    // ========================================
    
    function loadCandidates() {
        const $loading = $('#candidates-loading');
        const $container = $('#candidates-container');
        const $error = $('#candidates-error');
        const $grid = $('#candidates-grid');
        const $noCandidates = $('#no-candidates');

        $loading.show();
        $container.hide();
        $error.hide();

        $.ajax({
            url: voteSecure.ajaxUrl,
            type: 'POST',
            data: {
                action: 'vote_secure_fetch_candidates',
                nonce: voteSecure.nonce
            },
            success: function(response) {
                $loading.hide();
                
                if (response.success) {
                    const candidates = response.data.candidates || [];
                    
                    if (candidates.length === 0) {
                        $grid.html('');
                        $noCandidates.show();
                    } else {
                        $noCandidates.hide();
                        
                        let html = '';
                        candidates.forEach(function(candidate) {
                            const photoHtml = candidate.photo_url
                                ? `<div class="vote-secure-candidate-photo"><img src="${candidate.photo_url}" alt="${candidate.name}"></div>`
                                : `<div class="vote-secure-candidate-photo vote-secure-candidate-photo-placeholder"><span class="dashicons dashicons-admin-users"></span></div>`;
                            
                            const descHtml = candidate.description
                                ? `<p class="vote-secure-candidate-description">${candidate.description}</p>`
                                : '';
                            
                            html += `
                                <div class="vote-secure-candidate-card">
                                    ${photoHtml}
                                    <div class="vote-secure-candidate-info">
                                        <h3 class="vote-secure-candidate-name">${candidate.name}</h3>
                                        <span class="vote-secure-candidate-position">${candidate.position}</span>
                                        ${descHtml}
                                    </div>
                                </div>
                            `;
                        });
                        
                        $grid.html(html);
                    }
                    
                    $container.show();
                } else {
                    $('#candidates-error-message').text(response.data.message);
                    $error.show();
                }
            },
            error: function() {
                $loading.hide();
                $('#candidates-error-message').text('Failed to load candidates. Please try again.');
                $error.show();
            }
        });
    }

    // ========================================
    // Event Handlers
    // ========================================
    
    $(document).ready(function() {
        // Results page
        if ($('#results-container').length) {
            loadResults();
            
            $('#refresh-results-btn').on('click', function() {
                loadResults();
            });
        }

        // Voters page
        if ($('#voters-container').length) {
            loadVoters();
            
            $('#refresh-voters-btn').on('click', function() {
                loadVoters();
            });

            // Search
            let searchTimeout;
            $('#voters-search').on('input', function() {
                clearTimeout(searchTimeout);
                const term = $(this).val();
                searchTimeout = setTimeout(function() {
                    filterVoters(term);
                }, 300);
            });

            // Generate code button
            $('#generate-code-btn').on('click', function() {
                const firstName = $('#voter-first-name').val();
                const code = generateElectionCode(firstName);
                $('#voter-election-code').val(code);
            });

            // Add voter form
            $('#add-voter-form').on('submit', function(e) {
                e.preventDefault();
                
                const $form = $(this);
                const $spinner = $form.find('.spinner');
                const $result = $('#add-voter-result');
                
                $spinner.addClass('is-active');
                hideResult($result);
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_add_voter',
                        nonce: voteSecure.nonce,
                        first_name: $('#voter-first-name').val(),
                        last_name: $('#voter-last-name').val(),
                        election_code: $('#voter-election-code').val()
                    },
                    success: function(response) {
                        $spinner.removeClass('is-active');
                        
                        if (response.success) {
                            showResult($result, response.data.message, 'success');
                            $form[0].reset();
                            loadVoters();
                        } else {
                            showResult($result, response.data.message, 'error');
                        }
                    },
                    error: function() {
                        $spinner.removeClass('is-active');
                        showResult($result, 'An error occurred. Please try again.', 'error');
                    }
                });
            });

            // CSV upload form
            $('#csv-upload-form').on('submit', function(e) {
                e.preventDefault();
                
                const $form = $(this);
                const $spinner = $form.find('.spinner');
                const $result = $('#csv-upload-result');
                const fileInput = $('#csv-file')[0];
                
                if (!fileInput.files.length) {
                    showResult($result, 'Please select a CSV file.', 'error');
                    return;
                }
                
                const formData = new FormData();
                formData.append('action', 'vote_secure_upload_csv');
                formData.append('nonce', voteSecure.nonce);
                formData.append('csv_file', fileInput.files[0]);
                
                $spinner.addClass('is-active');
                hideResult($result);
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        $spinner.removeClass('is-active');
                        
                        if (response.success) {
                            showResult($result, response.data.message, 'success');
                            $form[0].reset();
                            loadVoters();
                        } else {
                            showResult($result, response.data.message, 'error');
                        }
                    },
                    error: function() {
                        $spinner.removeClass('is-active');
                        showResult($result, 'An error occurred. Please try again.', 'error');
                    }
                });
            });

            // Sheets sync form
            $('#sheets-sync-form').on('submit', function(e) {
                e.preventDefault();
                
                const $form = $(this);
                const $spinner = $form.find('.spinner');
                const $result = $('#sheets-sync-result');
                const sheetUrl = $('#sheet-url').val();
                
                if (!sheetUrl) {
                    showResult($result, 'Please enter a Google Sheets URL.', 'error');
                    return;
                }
                
                $spinner.addClass('is-active');
                hideResult($result);
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_sync_sheet_url',
                        nonce: voteSecure.nonce,
                        sheet_url: sheetUrl
                    },
                    success: function(response) {
                        $spinner.removeClass('is-active');
                        
                        if (response.success) {
                            showResult($result, response.data.message, 'success');
                            loadVoters();
                        } else {
                            showResult($result, response.data.message, 'error');
                        }
                    },
                    error: function() {
                        $spinner.removeClass('is-active');
                        showResult($result, 'An error occurred. Please try again.', 'error');
                    }
                });
            });
        }

        // Candidates page
        if ($('#candidates-container').length) {
            loadCandidates();
            
            $('#refresh-candidates-btn').on('click', function() {
                loadCandidates();
            });

            // Add candidate form
            $('#add-candidate-form').on('submit', function(e) {
                e.preventDefault();
                
                const $form = $(this);
                const $spinner = $form.find('.spinner');
                const $result = $('#add-candidate-result');
                
                $spinner.addClass('is-active');
                hideResult($result);
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_add_candidate',
                        nonce: voteSecure.nonce,
                        name: $('#candidate-name').val(),
                        position: $('#candidate-position').val(),
                        photo_url: $('#candidate-photo-url').val(),
                        description: $('#candidate-description').val()
                    },
                    success: function(response) {
                        $spinner.removeClass('is-active');
                        
                        if (response.success) {
                            showResult($result, response.data.message, 'success');
                            $form[0].reset();
                            loadCandidates();
                        } else {
                            showResult($result, response.data.message, 'error');
                        }
                    },
                    error: function() {
                        $spinner.removeClass('is-active');
                        showResult($result, 'An error occurred. Please try again.', 'error');
                    }
                });
            });

            // Add default candidates
            $('#add-default-candidates-btn').on('click', function() {
                const $btn = $(this);
                const $result = $('#default-candidates-result');
                
                $btn.prop('disabled', true).text('Adding...');
                hideResult($result);
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_add_default_candidates',
                        nonce: voteSecure.nonce
                    },
                    success: function(response) {
                        $btn.prop('disabled', false).html('<span class="dashicons dashicons-plus-alt2"></span> Add Default Candidates');
                        
                        if (response.success) {
                            showResult($result, response.data.message, 'success');
                            loadCandidates();
                        } else {
                            showResult($result, response.data.message, 'error');
                        }
                    },
                    error: function() {
                        $btn.prop('disabled', false).html('<span class="dashicons dashicons-plus-alt2"></span> Add Default Candidates');
                        showResult($result, 'An error occurred. Please try again.', 'error');
                    }
                });
            });
        }

        // Settings page
        if ($('#vote-secure-settings-form').length) {
            // Save settings
            $('#vote-secure-settings-form').on('submit', function(e) {
                e.preventDefault();
                
                const $form = $(this);
                const $spinner = $('#save-settings-spinner');
                const $result = $('#save-settings-result');
                
                $spinner.addClass('is-active');
                $result.removeClass('success error').text('');
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_save_settings',
                        nonce: voteSecure.nonce,
                        supabase_url: $('#supabase_url').val(),
                        supabase_anon_key: $('#supabase_anon_key').val(),
                        supabase_service_role_key: $('#supabase_service_role_key').val(),
                        google_sheets_spreadsheet_id: $('#google_sheets_spreadsheet_id').val(),
                        google_sheets_client_email: $('#google_sheets_client_email').val(),
                        google_sheets_private_key: $('#google_sheets_private_key').val(),
                        app_url: $('#app_url').val()
                    },
                    success: function(response) {
                        $spinner.removeClass('is-active');
                        
                        if (response.success) {
                            $result.addClass('success').text(response.data.message);
                        } else {
                            $result.addClass('error').text(response.data.message);
                        }
                    },
                    error: function() {
                        $spinner.removeClass('is-active');
                        $result.addClass('error').text('An error occurred. Please try again.');
                    }
                });
            });

            // Test Supabase
            $('#test-supabase-btn').on('click', function() {
                const $btn = $(this);
                const $result = $('#supabase-test-result');
                
                $btn.prop('disabled', true).text('Testing...');
                $result.hide().removeClass('success error');
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_test_supabase',
                        nonce: voteSecure.nonce
                    },
                    success: function(response) {
                        $btn.prop('disabled', false).text('Test Connection');
                        
                        if (response.success) {
                            $result.addClass('success').text(response.data.message).show();
                        } else {
                            $result.addClass('error').text(response.data.message).show();
                        }
                    },
                    error: function() {
                        $btn.prop('disabled', false).text('Test Connection');
                        $result.addClass('error').text('An error occurred. Please try again.').show();
                    }
                });
            });

            // Test Google Sheets
            $('#test-google-sheets-btn').on('click', function() {
                const $btn = $(this);
                const $result = $('#google-sheets-test-result');
                
                $btn.prop('disabled', true).text('Testing...');
                $result.hide().removeClass('success error');
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_test_google_sheets',
                        nonce: voteSecure.nonce
                    },
                    success: function(response) {
                        $btn.prop('disabled', false).text('Test Connection');
                        
                        if (response.success) {
                            $result.addClass('success').text(response.data.message).show();
                        } else {
                            $result.addClass('error').text(response.data.message).show();
                        }
                    },
                    error: function() {
                        $btn.prop('disabled', false).text('Test Connection');
                        $result.addClass('error').text('An error occurred. Please try again.').show();
                    }
                });
            });

            // Reset database
            $('#reset-db-btn').on('click', function() {
                const confirm = $('#reset-confirm').val();
                const $btn = $(this);
                const $result = $('#reset-db-result');
                
                if (confirm !== 'RESET') {
                    $result.addClass('error').text('Please type RESET to confirm.').show();
                    return;
                }
                
                if (!window.confirm(voteSecure.i18n.confirmReset)) {
                    return;
                }
                
                $btn.prop('disabled', true).text('Resetting...');
                $result.hide().removeClass('success error');
                
                $.ajax({
                    url: voteSecure.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'vote_secure_reset_db',
                        nonce: voteSecure.nonce,
                        confirm: confirm
                    },
                    success: function(response) {
                        $btn.prop('disabled', false).html('<span class="dashicons dashicons-trash"></span> Reset Database');
                        $('#reset-confirm').val('');
                        
                        if (response.success) {
                            $result.addClass('success').text(response.data.message).show();
                        } else {
                            $result.addClass('error').text(response.data.message).show();
                        }
                    },
                    error: function() {
                        $btn.prop('disabled', false).html('<span class="dashicons dashicons-trash"></span> Reset Database');
                        $result.addClass('error').text('An error occurred. Please try again.').show();
                    }
                });
            });
        }
    });

})(jQuery);

