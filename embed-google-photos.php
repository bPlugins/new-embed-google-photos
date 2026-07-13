<?php
/**
 * Plugin Name: Gallery For Google Photos
 * Description: Embed stunning Google Photos galleries directly into your WordPress site with the Google Photos Block plugin.
 * Version: 1.1.0
 * Author: bPlugins
 * Author URI: http://bplugins.com
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain: embed-google-photos
 */

// ABS PATH
if (!defined('ABSPATH')) {exit;}

class bpgpb_Embed_Google_Photos {
    public static $instance;

    private function __construct()
    {
        $this->load_classes();
        $this->constants_defined();

        add_action('enqueue_block_assets', [$this, 'enqueueBlockAssets']);
        add_action('init', [$this, 'onInit']);
    }

    public static function get_instance() {
        if(self::$instance) {
            return self::$instance;
        }

        self::$instance = new self();
        return self::$instance;
    }

    public function constants_defined() {
        // Constant
        define( 'BPGPB_PLUGIN_VERSION', isset( $_SERVER['HTTP_HOST'] ) && 'localhost' === $_SERVER['HTTP_HOST'] ? time() : '1.1.0' );
        define('BPGPB_ASSETS_DIR', plugin_dir_url(__FILE__) . 'assets/');
        define('BPGPB_DIR_URL', plugin_dir_url(__FILE__));
        define('BPGPB_DIR_PATH', plugin_dir_path(__FILE__));
    }

    public function load_classes () {
        require_once plugin_dir_path(__FILE__) . '/GoogleAPI/google-api.php';
        require_once plugin_dir_path(__FILE__) . '/GoogleAPI/GooglePhotos.php';
        require_once plugin_dir_path(__FILE__) . '/includes/custom-post.php';
        require_once plugin_dir_path(__FILE__) . '/includes/admin-menu.php';
    }

    public function enqueueBlockAssets()
    {
        // External Fancybox lightbox assets. Registered here so the block's
        // block.json can list them as `style` / `viewScript` dependencies.
        wp_register_style('fancyapps', BPGPB_ASSETS_DIR . 'css/fancyapps.min.css', [], '5.0');
        wp_register_script('fancyapps', BPGPB_ASSETS_DIR . 'js/fancyapps.min.js', [], '5.0', true);

        wp_localize_script('fancyapps', 'bpgpbSessionId', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }

    public function onInit()
    {
        // All scripts, styles and the render.php are declared in build/block.json.
        register_block_type(__DIR__ . '/build'); // Register Block

        wp_set_script_translations('bpgpb-google-photos-editor-script', 'embed-google-photos', plugin_dir_path(__FILE__) . 'languages'); // Translate
    }
}
bpgpb_Embed_Google_Photos::get_instance();