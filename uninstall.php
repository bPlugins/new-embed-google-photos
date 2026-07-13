<?php
/**
 * Gallery For Google Photos – uninstall cleanup.
 *
 * Removes the stored Google credentials / access token when the plugin is
 * deleted from the WordPress admin, so no secrets linger in the database.
 *
 * @package embed-google-photos
 */

// Only run when WordPress is uninstalling this plugin.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

/**
 * Delete all plugin data for the current site.
 */
function bpgpb_uninstall_cleanup() {
    // Stored Google OAuth credentials + access token.
    delete_option('bpgpb-google-photos');
}

if (is_multisite()) {
    $bpgpb_site_ids = get_sites(['fields' => 'ids']);
    foreach ($bpgpb_site_ids as $bpgpb_site_id) {
        switch_to_blog($bpgpb_site_id);
        bpgpb_uninstall_cleanup();
        restore_current_blog();
    }
} else {
    bpgpb_uninstall_cleanup();
}
