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
    }

    public function load_classes () {
        require_once plugin_dir_path(__FILE__) . '/GoogleAPI/google-api.php';
        require_once plugin_dir_path(__FILE__) . '/GoogleAPI/GooglePhotos.php';
    }

    public function enqueueBlockAssets()
    {
        wp_register_style('fancyapps', BPGPB_ASSETS_DIR . 'css/fancyapps.min.css', [], '5.0');
        wp_register_style('bpgpb-google-photos-style', plugins_url('dist/style.css', __FILE__), ['fancyapps'], BPGPB_PLUGIN_VERSION);

        wp_register_script('fancyapps', BPGPB_ASSETS_DIR . 'js/fancyapps.min.js', [], '5.0', true);
        wp_register_script('bpgpb-google-photos-script', plugins_url('dist/script.js', __FILE__), ['fancyapps'], BPGPB_PLUGIN_VERSION, true);

        wp_localize_script('fancyapps', 'bpgpbSessionId', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }

    public function onInit()
    {
        wp_register_style('bpgpb-block-directory-editor-style', plugins_url('dist/editor.css', __FILE__), ['wp-edit-blocks', 'bpgpb-google-photos-style'], BPGPB_PLUGIN_VERSION); // Backend Style

        register_block_type(__DIR__, [
            'editor_style' => 'bpgpb-block-directory-editor-style',
            'render_callback' => [$this, 'render'],
        ]); // Register Block

        wp_set_script_translations('BPGPB-block-directory-editor-script', 'embed-google-photos', plugin_dir_path(__FILE__) . 'languages'); // Translate
    }

    public function render($attributes)
    {
        $cId      = isset($attributes['cId']) ? $attributes['cId'] : '';
        $selected = (isset($attributes['selectedPhotos']) && is_array($attributes['selectedPhotos'])) ? $attributes['selectedPhotos'] : [];

        $columns = isset($attributes['columns']['desktop']) ? absint($attributes['columns']['desktop']) : 3;
        if ($columns < 1) {
            $columns = 1;
        }

        wp_enqueue_style('bpgpb-google-photos-style');
        wp_enqueue_script('bpgpb-google-photos-script');

        // apiVersion 3: WordPress builds the wrapper (class, alignment, custom
        // classNames). Photos render from the Media Library — no token client-side.
        $wrapper_attributes = get_block_wrapper_attributes([
            'id'    => 'BPGPBBlockDirectory-' . $cId,
            'class' => 'bpgpb-gallery',
        ]);

        ob_start(); ?>
		<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() escapes its values. ?>>
			<?php if (!empty($selected)) : ?>
				<div class="bpgpb-grid" style="--bpgpb-cols: <?php echo esc_attr($columns); ?>">
					<?php foreach ($selected as $photo) :
						$full  = isset($photo['url']) ? $photo['url'] : '';
						$thumb = isset($photo['thumb']) ? $photo['thumb'] : $full;
						if (!$full) {
							continue;
						}
						?>
						<a class="bpgpb-item" href="<?php echo esc_url($full); ?>" data-fancybox="bpgpb-<?php echo esc_attr($cId); ?>">
							<img src="<?php echo esc_url($thumb); ?>" loading="lazy" alt="" />
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>

		<?php return ob_get_clean();
    } // Render
}
bpgpb_Embed_Google_Photos::get_instance();