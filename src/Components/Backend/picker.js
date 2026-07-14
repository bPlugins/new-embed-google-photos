// Drives the Google Photos Picker flow from the editor.
// All Google calls happen server-side (the token stays on the server); this
// only talks to our own admin-ajax handlers.

const ajax = (action, data = {}) =>
	new Promise((resolve, reject) => {
		wp.ajax.post(action, data).done(resolve).fail(reject);
	});

// Resolves after `ms`, or immediately if the abort signal fires — so a Cancel
// click doesn't have to wait out the current poll interval.
const wait = (ms, signal) =>
	new Promise((resolve) => {
		const timer = setTimeout(resolve, ms);
		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					clearTimeout(timer);
					resolve();
				},
				{ once: true }
			);
		}
	});

/**
 * Run the full pick -> poll -> import cycle.
 *
 * @param {string}   nonce           wp_rest nonce.
 * @param {Function} onStatus        Optional progress callback (receives a string).
 * @param {Object}   [options]       Extra options.
 * @param {AbortSignal} [options.signal] Abort the wait/poll loop (Cancel button).
 * @return {Promise<Array>} Imported photos: [{ id, url, thumb, width, height }].
 */
export async function runPicker(nonce, onStatus = () => {}, { signal } = {}) {
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
	// Poll roughly once a second (never faster than Google's suggested interval).
	const interval = Math.max(1000, Math.min(pollIntervalMs, 2000));
	let picked = false;

	// The only reliable signal that the user finished picking is the server-side
	// `mediaItemsSet` flag. We deliberately do NOT treat `popup.closed` as a
	// "cancelled" signal: on live HTTPS sites Google routes the picker through
	// its login/consent screen, whose COOP policy severs our reference to the
	// popup so `popup.closed` reads true even while the window is still open.
	// Relying on it made the flow give up after a few seconds and import nothing.
	// So we simply poll until the selection registers or the timeout elapses.
	while (Date.now() - startedAt < timeoutMs) {
		if (signal?.aborted) {
			break;
		}

		await wait(interval, signal);

		if (signal?.aborted) {
			break;
		}

		const status = await ajax('bpgpb_poll_picker_session', { nonce, sessionId });
		if (status && status.mediaItemsSet) {
			picked = true;
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
