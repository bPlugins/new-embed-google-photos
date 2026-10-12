/**
 * Shared album storage mode: 'google' (serve from Google) or 'media' (download).
 *
 * Unset keepOnGoogle defaults to Google, except for galleries that already hold
 * Media Library album photos, so they keep using the Media Library.
 */
export const albumStorageMode = (keepOnGoogle, selectedPhotos = []) => {
	const fromGoogle = undefined === keepOnGoogle ? !selectedPhotos.some((p) => p && p.syncKey && !p.remote) : !!keepOnGoogle;
	return fromGoogle ? 'google' : 'media';
};
