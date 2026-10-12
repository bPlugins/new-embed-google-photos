import { useState, useEffect, useRef } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { Button, Spinner, TextControl, ToggleControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import { Notice as ProNotice } from '../../../../bpl-tools/Components';
import useIframeAssetSync from '../../../../bpl-tools/hooks/useIframeAssetSync';
import useWPAjax from '../../hooks/useWPAjax';
import { runPicker } from './picker';
import Settings from './Settings/Settings';
import Gallery from '../Frontend/Gallery';
import Style from '../Common/Style';
import ClipBoard from './ShortcodeCopy';
import { googleIcon } from '../../utils/icons';
import { albumStorageMode } from '../../utils/albumStorage';
import { syncAlbum } from '../../utils/syncAlbum';
import { authDocsUrl, videos } from '../../admin/utils/data';
import { VideoTip } from './VideoLink';

const Edit = (props) => {
	const { attributes, setAttributes, clientId } = props;
	const { selectedPhotos = [] } = attributes;

	// When the block is edited inside a Gallery (bpgpb_gallery) post, show a
	// copy-to-clipboard shortcode box so the user can embed it elsewhere.
	const { postId, postType } = useSelect((select) => ({
		postId: select('core/editor')?.getCurrentPostId(),
		postType: select('core/editor')?.getCurrentPostType(),
	}), []);
	const isGalleryCPT = 'bpgpb_gallery' === postType;
	const shortcode = `[google_photos id=${postId}]`;

	// Persist a stable id so the frontend wrapper + Fancybox grouping work.
	useEffect(() => {
		if (clientId) {
			setAttributes({ cId: clientId.substring(0, 10) });
		}
	}, [clientId]);

	const blockProps = useBlockProps({ id: `BPGPBBlockDirectory-${clientId}` });

	// Clone the block's frontend + editor stylesheets into the editor canvas
	// iframe so the in-editor gallery preview matches the frontend render.
	// The gallery preview is a React component, so no view scripts are needed.
	useIframeAssetSync(['bpgpb-google-photos-style-css', 'bpgpb-google-photos-editor-style-css']);


	// Connection check (admin-only handler). The handler returns only a boolean;
	// the access token itself never leaves the server.
	const { isLoading, data: token, refetch } = useWPAjax('bpgpb_retrieve_access_token', {
		nonce: window.wpApiSettings?.nonce,
	});

	// Re-check the connection whenever the authorization sidebar saves (e.g. the
	// admin clears the credentials) so the block updates without a page reload.
	useEffect(() => {
		const onAuthChange = () => refetch({ nonce: window.wpApiSettings?.nonce });
		window.addEventListener('bpgpbEventEdit', onAuthChange);
		return () => window.removeEventListener('bpgpbEventEdit', onAuthChange);
	}, []);

	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState('');
	const [isError, setIsError] = useState(false);
	// Lets the Cancel button stop an in-flight picker session.
	const abortRef = useRef(null);
	// Lets the same Cancel button stop a multi-request album sync.
	const stopSyncRef = useRef(false);

	const pickPhotos = async () => {
		setBusy(true);
		setIsError(false);
		setStatus('');
		const controller = new AbortController();
		abortRef.current = controller;
		try {
			const photos = await runPicker(window.wpApiSettings?.nonce, setStatus, {
				signal: controller.signal,
			});
			if (photos.length) {
				setAttributes({ selectedPhotos: photos });
				// Clear the progress message; the gallery preview is the feedback.
				setStatus('');
			} else {
				// No new selection — keep the existing gallery if there is one,
				// otherwise fall back to the current select screen. No error shown.
				setStatus('');
			}
		} catch (e) {
			setIsError(true);
			setStatus(
				(e && e.message) ||
				__('Something went wrong. Please try again.', 'embed-google-photos')
			);
		}
		abortRef.current = null;
		setBusy(false);
	};

	const cancelPicker = () => {
		abortRef.current?.abort();
		stopSyncRef.current = true;
		setStatus(__('Cancelling…', 'embed-google-photos'));
	};

	// Add the photos of a shared album (no Google credentials needed). Photos
	// already in the gallery are skipped, so clicking again adds only new ones.
	// Automatic background sync is a Pro feature.
	const syncAlbumLink = async () => {
		const url = (attributes.syncUrl || '').trim();
		if (!url) {
			setIsError(true);
			setStatus(__('Paste a shared album link first.', 'embed-google-photos'));
			return;
		}

		setBusy(true);
		setIsError(false);
		setStatus(__('Adding album photos from Google Photos…', 'embed-google-photos'));

		stopSyncRef.current = false;
		try {
			const photos = await syncAlbum(
				{ url, storage: albumStorageMode(attributes.keepOnGoogle, selectedPhotos) },
				selectedPhotos.map((p) => p.syncKey).filter(Boolean),
				(added) => {
					setAttributes({ selectedPhotos: [...selectedPhotos, ...added] });
					setStatus(sprintf(/* translators: %d: number of photos */ __('Adding… %d photos so far', 'embed-google-photos'), added.length));
				},
				() => stopSyncRef.current
			);
			if (photos.length) {
				setAttributes({ selectedPhotos: [...selectedPhotos, ...photos] });
			}
			setIsError(false);
			setStatus(
				photos.length
					? sprintf(/* translators: %d: number of photos */ __('%d photo(s) added from the album.', 'embed-google-photos'), photos.length)
					: __('No new photos in this album.', 'embed-google-photos')
			);
		} catch (err) {
			setIsError(true);
			setStatus((err && (err.message || err)) || __('Could not add the album. Check the link.', 'embed-google-photos'));
		}
		setBusy(false);
	};

	const openAuthSidebar = () =>
		wp.data
			.dispatch('core/edit-post')
			.openGeneralSidebar('bpgpb-google-photos/bpgpb-google-photos');

	if (isLoading) {
		return (
			<div {...blockProps}>
				<div className="bpgpb-loading" role="status" aria-live="polite">
					<Spinner />
					<span>{__('Checking connection…', 'embed-google-photos')}</span>
				</div>
			</div>
		);
	}

	// Shared albums need no Google credentials; only "Select from Google Photos"
	// (the Picker API) does.
	const connected = !!token?.connected;

	return (
		<>
			{selectedPhotos.length > 0 && (
				<Settings
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			)}

			<div {...blockProps}>
				{isGalleryCPT && <ClipBoard shortcode={shortcode} />}
				<Style attributes={attributes} cId={attributes.cId || clientId} />
				<div className="bpgpb-gallery">
					<Gallery
						attributes={attributes}
						cId={attributes.cId || clientId}
						isBackend={true}
						setAttributes={setAttributes}
					/>
				</div>

				<div className={`bpgpbSelectArea${selectedPhotos.length ? ' is-compact' : ' bpgpb-card'}`}>
					{busy ? (
						<div className="bpgpb-picker-status" role="status" aria-live="polite">
							<Spinner />
							<span>{status || __('Working…', 'embed-google-photos')}</span>
							<Button
								variant="tertiary"
								className="bpgpb-btn-cancel"
								onClick={cancelPicker}
							>
								{__('Cancel', 'embed-google-photos')}
							</Button>
						</div>
					) : (
						<>
							{selectedPhotos.length === 0 && (
								<>
									<span className="bpgpb-card__icon">{googleIcon}</span>
									<h2 className="bpgpb-card__title">
										{connected
											? __('Select photos from Google Photos', 'embed-google-photos')
											: __('Add a shared Google Photos album', 'embed-google-photos')}
									</h2>
									<p className="bpgpb-card__desc">
										{connected
											? __('Pick images and videos to display in your gallery.', 'embed-google-photos')
											: __('Paste the link of a shared album. No Client ID or Client Secret needed.', 'embed-google-photos')}
									</p>
								</>
							)}
							{connected && (
								<Button variant="primary" className="bpgpb-btn" onClick={pickPhotos}>
									{selectedPhotos.length
										? __('Change photos', 'embed-google-photos')
										: __('Select from Google Photos', 'embed-google-photos')}
								</Button>
							)}

							<div className="bpgpb-album-sync">
								<span className="bpgpb-album-sync__or">
									{connected
										? __('or add a shared album', 'embed-google-photos')
										: __('Shared album link', 'embed-google-photos')}
									<VideoTip url={videos.keepOnGoogle} title={__('Shared albums on Google Photos', 'embed-google-photos')} />
								</span>
								<div className="bpgpb-album-sync__row">
									<TextControl
										type="url"
										className="bpgpb-album-sync__input"
										value={attributes.syncUrl || ''}
										placeholder="https://photos.app.goo.gl/…"
										onChange={(val) => setAttributes({ syncUrl: val })}
										__nextHasNoMarginBottom
									/>
									<Button variant="secondary" className="bpgpb-btn" onClick={syncAlbumLink}>
										{__('Save & Sync', 'embed-google-photos')}
									</Button>
								</div>
								<ToggleControl
									className="bpgpb-album-sync__storage"
									label={__('Keep photos on Google Photos', 'embed-google-photos')}
									checked={'google' === albumStorageMode(attributes.keepOnGoogle, selectedPhotos)}
									onChange={(val) => setAttributes({ keepOnGoogle: val })}
									__nextHasNoMarginBottom
								/>
							</div>

							{status && <p className={`bpgpb-picker-note${isError ? ' is-error' : ''}`}>{status}</p>}

							{!connected && (
								<div className="bpgpb-keys-notice">
									<p>{__('Want to choose photos one by one with “Select from Google Photos”? Add your Google Client ID and Client Secret first.', 'embed-google-photos')}</p>
									<div className="bpgpb-keys-notice__actions">
										<Button variant="secondary" size="compact" onClick={openAuthSidebar}>
											{__('Add Client ID & Secret', 'embed-google-photos')}
										</Button>
										<a href={authDocsUrl} target="_blank" rel="noopener noreferrer">
											{__('How to get them →', 'embed-google-photos')}
										</a>
									</div>
								</div>
							)}

							<ProNotice status="premium" isIcon={true} className="mt10">
								{__('New album photos appear automatically with Auto-Sync in the Pro version.', 'embed-google-photos')}
								<span className="bpgpb-promo-links">
									<a href={videos.keepOnGoogle} target="_blank" rel="noopener noreferrer">{__('▶ Auto-Sync in action · 35 sec', 'embed-google-photos')}</a>
									<a href={videos.reusePromo} target="_blank" rel="noopener noreferrer">{__('▶ One gallery design for every album · 35 sec', 'embed-google-photos')}</a>
								</span>
							</ProNotice>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Edit;
