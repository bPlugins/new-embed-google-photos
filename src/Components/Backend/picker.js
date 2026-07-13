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
	// Poll at most once a second so the picker's "Done" window closes about a
	// second after the user finishes selecting.
	const interval = Math.min(pollIntervalMs, 1000);
	let picked = false;

	while (Date.now() - startedAt < timeoutMs) {
		await wait(interval);

		// Authoritative signal: the selection is registered server-side. Check
		// this first, every iteration, regardless of the popup's state.
		const status = await ajax('bpgpb_poll_picker_session', { nonce, sessionId });
		if (status && status.mediaItemsSet) {
			picked = true;
			break;
		}

		// The user closed the picker window but nothing has registered yet. Give
		// Google a short grace period (mediaItemsSet can lag a couple seconds
		// after "Done") before concluding it was a cancel.
		if (popup && popup.closed) {
			for (let i = 0; i < 4 && !picked; i++) {
				await wait(1000);
				const late = await ajax('bpgpb_poll_picker_session', { nonce, sessionId });
				if (late && late.mediaItemsSet) {
					picked = true;
				}
			}
			break;
		}
	}

	// Best-effort: auto-close the picker window ~2.5s after "Done" (retrying a
	// few times). Call close() unconditionally — when Google routed the picker
	// through its login/consent screen its COOP policy severs our window
	// reference, which makes popup.closed report true even while the window is
	// open; in that severed case the browser blocks close() and the user has to
	// close the window manually. This is a Google-side limitation.
	setTimeout(function closePicker(attempt = 0) {
		try {
			if (popup) {
				popup.close();
			}
		} catch (e) {
			// ignore cross-origin / severed-reference errors
		}
		if (popup && !popup.closed && attempt < 4) {
			setTimeout(() => closePicker(attempt + 1), 500);
		}
	}, 2500);

	// Nothing was selected (cancelled, closed, or timed out). Return empty so the
	// caller can keep the current gallery instead of surfacing an error.
	if (!picked) {
		return [];
	}

	onStatus('Importing photos into your Media Library…');
	const result = await ajax('bpgpb_import_picked_photos', { nonce, sessionId });

	return result && result.photos ? result.photos : [];
}
