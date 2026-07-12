<?php
// ABS PATH
if (!defined('ABSPATH')) {exit;}

/**
 * Google Photos Picker API integration.
 *
 * The legacy Library API (photoslibrary.googleapis.com) was retired by Google on
 * 2025-03-31, so this plugin uses the Picker API: the admin picks photos in
 * Google's own UI, we import the picked images into the WordPress Media Library,
 * and the block renders those local images. All handlers are admin-only — the
 * OAuth token never reaches the browser.
 */
class GooglePhotosAPI
{
    const PICKER_BASE = 'https://photospicker.googleapis.com/v1';

    public function __construct()
    {
        // OAuth connect (admin enters their own Google credentials).
        add_action('wp_ajax_retrieve_refresh_token', [$this, 'retrieve_refresh_token']);
        // Editor connection check.
        add_action('wp_ajax_bpgpb_retrieve_access_token', [$this, 'bpgpb_retrieve_access_token']);
        // Picker flow: create session -> poll -> import.
        add_action('wp_ajax_bpgpb_create_picker_session', [$this, 'create_picker_session']);
        add_action('wp_ajax_bpgpb_poll_picker_session', [$this, 'poll_picker_session']);
        add_action('wp_ajax_bpgpb_import_picked_photos', [$this, 'import_picked_photos']);
    }

    /**
     * Guard: every handler requires an authenticated admin + a valid nonce.
     * Sends a JSON error and stops when the request is not allowed.
     */
    private function verify_admin_request()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('unauthorized');
        }
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'wp_rest')) {
            wp_send_json_error('invalid request');
        }
    }

    /** Get a fresh, valid access token from the server-side stored credentials. */
    private function get_access_token()
    {
        $token = (new GooglePhotos())->get_client_token();
        return isset($token['access_token']) ? $token['access_token'] : '';
    }

    /**
     * Exchange the admin-supplied refresh token for an access token and store it.
     */
    public function retrieve_refresh_token()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('unauthorized');
        }
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'wp_rest')) {
            wp_send_json_error('invalid request');
        }

        $should_i_save = isset($_POST['save']) ? sanitize_text_field(wp_unslash($_POST['save'])) : '';

        $data = get_option('bpgpb_auth_info');
        if (!$should_i_save && $data) {
            wp_send_json_success($data);
        }

        $client_id     = isset($_POST['client_id']) ? sanitize_text_field(wp_unslash($_POST['client_id'])) : '';
        $client_secret = isset($_POST['client_secret']) ? sanitize_text_field(wp_unslash($_POST['client_secret'])) : '';
        $refresh_token = isset($_POST['refresh_token']) ? sanitize_text_field(wp_unslash($_POST['refresh_token'])) : '';

        if (!$client_id || !$client_secret || !$refresh_token) {
            wp_send_json_error('data missing');
        }

        $data = compact('client_id', 'client_secret', 'refresh_token');

        $response = wp_remote_post('https://oauth2.googleapis.com/token', [
            'body' => [
                'client_id'     => $client_id,
                'client_secret' => $client_secret,
                'refresh_token' => $refresh_token,
                'grant_type'    => 'refresh_token',
            ],
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }

        $token = json_decode(wp_remote_retrieve_body($response), true);
        $token['refresh_token'] = $refresh_token;

        update_option('bpgpb_auth_info', $data);
        update_option('bpgpb-google-photos', wp_json_encode($token));
        set_transient('bpgpb_expireTime', 3500, 3500);

        wp_send_json_success($data);
    }

    /**
     * Report whether the site is connected to Google Photos (editor uses this).
     * Returns only the short-lived access token, never the refresh token.
     */
    public function bpgpb_retrieve_access_token()
    {
        $this->verify_admin_request();

        $access_token = $this->get_access_token();
        wp_send_json_success(['access_token' => $access_token]);
    }

    /**
     * Create a Picker session. Returns the pickerUri the admin opens to select
     * photos, plus polling hints.
     */
    public function create_picker_session()
    {
        $this->verify_admin_request();

        $access_token = $this->get_access_token();
        if (!$access_token) {
            wp_send_json_error('not_connected');
        }

        $response = wp_remote_post(self::PICKER_BASE . '/sessions', [
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type'  => 'application/json',
            ],
            'body'    => '{}',
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (200 !== (int) $code || empty($body['pickerUri'])) {
            wp_send_json_error(['status' => $code, 'body' => $body]);
        }

        // pollingConfig.pollInterval looks like "5s"; (int) cast yields 5.
        $poll_seconds = isset($body['pollingConfig']['pollInterval']) ? (int) $body['pollingConfig']['pollInterval'] : 3;
        if ($poll_seconds < 2) {
            $poll_seconds = 2;
        }

        wp_send_json_success([
            'sessionId'      => isset($body['id']) ? $body['id'] : '',
            'pickerUri'      => $body['pickerUri'],
            'pollIntervalMs' => $poll_seconds * 1000,
            'timeoutMs'      => 5 * 60 * 1000,
        ]);
    }

    /** Poll a session; true once the user has finished picking. */
    public function poll_picker_session()
    {
        $this->verify_admin_request();

        $session_id = isset($_POST['sessionId']) ? sanitize_text_field(wp_unslash($_POST['sessionId'])) : '';
        if (!$session_id) {
            wp_send_json_error('missing_session');
        }

        $access_token = $this->get_access_token();
        $response = wp_remote_get(self::PICKER_BASE . '/sessions/' . rawurlencode($session_id), [
            'timeout' => 30,
            'headers' => ['Authorization' => 'Bearer ' . $access_token],
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        wp_send_json_success(['mediaItemsSet' => !empty($body['mediaItemsSet'])]);
    }

    /**
     * Import the picked photos: list the session's media items, download each
     * (authenticated) into the Media Library, and return local attachment data.
     */
    public function import_picked_photos()
    {
        $this->verify_admin_request();

        $session_id = isset($_POST['sessionId']) ? sanitize_text_field(wp_unslash($_POST['sessionId'])) : '';
        if (!$session_id) {
            wp_send_json_error('missing_session');
        }

        $access_token = $this->get_access_token();
        if (!$access_token) {
            wp_send_json_error('not_connected');
        }

        // List every picked media item (paginated).
        $items      = [];
        $page_token = '';
        do {
            $url = add_query_arg(
                array_filter([
                    'sessionId' => $session_id,
                    'pageSize'  => 100,
                    'pageToken' => $page_token,
                ]),
                self::PICKER_BASE . '/mediaItems'
            );

            $response = wp_remote_get($url, [
                'timeout' => 30,
                'headers' => ['Authorization' => 'Bearer ' . $access_token],
            ]);
            if (is_wp_error($response)) {
                break;
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (!empty($body['mediaItems'])) {
                $items = array_merge($items, $body['mediaItems']);
            }
            $page_token = isset($body['nextPageToken']) ? $body['nextPageToken'] : '';
        } while ($page_token && count($items) < 100);

        // Download + sideload each photo into the Media Library.
        $photos = [];
        foreach ($items as $item) {
            $type = isset($item['type']) ? $item['type'] : '';
            if ('PHOTO' !== $type) {
                continue; // MVP: images only; video is a follow-up.
            }

            $media_file = isset($item['mediaFile']) ? $item['mediaFile'] : [];
            $base_url   = isset($media_file['baseUrl']) ? $media_file['baseUrl'] : '';
            if (!$base_url) {
                continue;
            }
            $filename = isset($media_file['filename']) ? $media_file['filename'] : '';

            $attachment_id = $this->sideload_photo($base_url, $filename, $access_token);
            if (!$attachment_id) {
                continue;
            }

            $full  = wp_get_attachment_image_url($attachment_id, 'full');
            $large = wp_get_attachment_image_url($attachment_id, 'large');
            $meta  = wp_get_attachment_metadata($attachment_id);

            $photos[] = [
                'id'     => $attachment_id,
                'url'    => $full ? $full : '',
                'thumb'  => $large ? $large : ($full ? $full : ''),
                'width'  => isset($meta['width']) ? (int) $meta['width'] : 0,
                'height' => isset($meta['height']) ? (int) $meta['height'] : 0,
            ];
        }

        // Best-effort session cleanup.
        wp_remote_request(self::PICKER_BASE . '/sessions/' . rawurlencode($session_id), [
            'method'  => 'DELETE',
            'timeout' => 15,
            'headers' => ['Authorization' => 'Bearer ' . $access_token],
        ]);

        wp_send_json_success(['photos' => $photos]);
    }

    /**
     * Download a picked photo (a sized JPEG needs the Bearer token) and add it
     * to the Media Library. Returns an attachment ID, or 0 on failure.
     */
    private function sideload_photo($base_url, $filename, $access_token)
    {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        // Sized downloads come back as JPEG regardless of the original format.
        $response = wp_remote_get($base_url . '=w2048', [
            'timeout' => 30,
            'headers' => ['Authorization' => 'Bearer ' . $access_token],
        ]);
        if (is_wp_error($response) || 200 !== (int) wp_remote_retrieve_response_code($response)) {
            return 0;
        }
        $bytes = wp_remote_retrieve_body($response);
        if ('' === $bytes) {
            return 0;
        }

        $base = pathinfo(sanitize_file_name($filename), PATHINFO_FILENAME);
        if ('' === $base) {
            $base = 'google-photo-' . substr(md5($base_url), 0, 8);
        }
        $safe_name = $base . '.jpg';

        $tmp = wp_tempnam($safe_name);
        if (!$tmp) {
            return 0;
        }

        global $wp_filesystem;
        if (empty($wp_filesystem)) {
            WP_Filesystem();
        }
        $wp_filesystem->put_contents($tmp, $bytes, FS_CHMOD_FILE);

        $file_array    = ['name' => $safe_name, 'tmp_name' => $tmp];
        $attachment_id = media_handle_sideload($file_array, 0);

        if (is_wp_error($attachment_id)) {
            wp_delete_file($tmp);
            return 0;
        }
        return (int) $attachment_id;
    }
}
new GooglePhotosAPI();
