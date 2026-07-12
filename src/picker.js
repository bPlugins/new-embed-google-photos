// Drives the Google Photos Picker flow from the editor.
// All Google calls happen server-side (the token stays on the server); this
// only talks to our own admin-ajax handlers.

const ajax = (action, data = {}) =>
	new Promise((resolve, reject) => {
		wp.ajax.post(action, data).done(resolve).fail(reject);
	});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run the full pick -> poll -> import cycle.
 *
 * @param {string}   nonce    wp_rest nonce.
 * @param {Function} onStatus Optional progress callback (receives a string).
 * @return {Promise<Array>} Imported photos: [{ id, url, thumb, width, height }].
 */
export async function runPicker(nonce, onStatus = () => {}) {
	onStatus('Creating a Google Photos session…');
	const session = await ajax('bpgpb_create_picker_session', { nonce });

	const {
		sessionId,
		pickerUri,
		pollIntervalMs = 3000,
		timeoutMs = 300000,
	} = session || {};

	if (!pickerUri || !sessionId) {
		throw new Error('Could not start a Google Photos session.');
	}

	const popup = window.open(pickerUri, 'bpgpbPicker', 'width=1024,height=768');

	onStatus('Waiting for you to pick photos in Google Photos…');
	const startedAt = Date.now();
	let picked = false;

	while (Date.now() - startedAt < timeoutMs) {
		await wait(pollIntervalMs);
		const status = await ajax('bpgpb_poll_picker_session', { nonce, sessionId });
		if (status && status.mediaItemsSet) {
			picked = true;
			break;
		}
	}

	try {
		if (popup && !popup.closed) {
			popup.close();
		}
	} catch (e) {
		// ignore cross-origin close errors
	}

	if (!picked) {
		throw new Error('Timed out waiting for a photo selection.');
	}

	onStatus('Importing photos into your Media Library…');
	const result = await ajax('bpgpb_import_picked_photos', { nonce, sessionId });

	return result && result.photos ? result.photos : [];
}
