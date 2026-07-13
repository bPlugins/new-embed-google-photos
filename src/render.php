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

// Enrich each photo from its Media Library attachment so the gallery can render
// a low-res blur-up placeholder while the full image loads. Done here (rather
// than only at import time) so galleries picked before this feature existed get
// the placeholder too, without re-importing. Attachment lookups are cached by WP.
if ( ! empty( $attributes['selectedPhotos'] ) && is_array( $attributes['selectedPhotos'] ) ) {
	foreach ( $attributes['selectedPhotos'] as &$bpgpb_photo ) {
		$bpgpb_att_id = isset( $bpgpb_photo['id'] ) ? absint( $bpgpb_photo['id'] ) : 0;
		if ( ! $bpgpb_att_id || ! empty( $bpgpb_photo['placeholder'] ) ) {
			continue;
		}

		// The WordPress "thumbnail" size (~150px) is tiny enough to load almost
		// instantly and looks good blurred. Videos aren't image attachments, so
		// fall back to their stored poster.
		$bpgpb_ph = wp_get_attachment_image_url( $bpgpb_att_id, 'thumbnail' );
		if ( $bpgpb_ph ) {
			$bpgpb_photo['placeholder'] = $bpgpb_ph;
		} elseif ( ! empty( $bpgpb_photo['thumb'] ) ) {
			$bpgpb_photo['placeholder'] = $bpgpb_photo['thumb'];
		}
	}
	unset( $bpgpb_photo );
}

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
