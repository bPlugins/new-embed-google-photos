<?php
/**
 * Frontend markup for the Embed Google Photos block.
 *
 * Renders an empty wrapper carrying the block attributes as JSON. The view
 * script (view.js) rehydrates the shared Gallery React component from it, so
 * the frontend and the editor render every setting identically.
 *
 * @var array $attributes Block attributes provided by WordPress.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bpgpb_cid = ! empty( $attributes['cId'] ) ? $attributes['cId'] : wp_unique_id();
$bpgpb_id  = 'bpgpbGooglePhotos-' . $bpgpb_cid;

$bpgpb_wrapper = get_block_wrapper_attributes(
	array(
		'id'    => $bpgpb_id,
		'class' => 'bpgpb-gallery',
	)
);
?>
<div
	<?php echo wp_kses_post( $bpgpb_wrapper ); ?>
	data-attributes='<?php echo esc_attr( wp_json_encode( $attributes ) ); ?>'>
</div>
