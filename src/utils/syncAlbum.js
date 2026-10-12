/**
 * Sync one shared album, calling the server again while it reports "more".
 *
 * In Media Library mode each request downloads for a limited time, so a big
 * album arrives over several requests instead of timing out in one. onBatch
 * gets every photo added so far, so callers can save progress as it comes.
 * Rejects only if nothing was added; a later failure returns what arrived.
 *
 * @param {Object}   data     bpgpb_sync_album fields (url, storage).
 * @param {string[]} existing syncKeys already in the gallery.
 * @param {Function} onBatch  Called with all photos added so far.
 * @param {Function} stopped  Returns true to stop after the current request.
 * @return {Promise<Array>} New photos.
 */
export const syncAlbum = async (data, existing = [], onBatch = () => {}, stopped = () => false) => {
	const known = [...existing];
	const added = [];
	for (;;) {
		let res;
		try {
			res = await wp.ajax.post('bpgpb_sync_album', {
				nonce: window.wpApiSettings?.nonce,
				...data,
				existing: JSON.stringify(known),
			});
		} catch (err) {
			if (!added.length) {
				throw err;
			}
			break;
		}
		const photos = (res && res.photos) || [];
		added.push(...photos);
		known.push(...photos.map((p) => p.syncKey).filter(Boolean));
		if (photos.length) {
			onBatch(added);
		}
		if (!res || !res.more || !photos.length || stopped()) {
			break;
		}
	}
	return added;
};
