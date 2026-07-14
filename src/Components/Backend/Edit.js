import { useState, useEffect, useRef } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import useWPAjax from '../../hooks/useWPAjax';
import { runPicker } from './picker';
import Settings from './Settings/Settings';
import Gallery from '../Frontend/Gallery';
import Style from '../Common/Style';
import ClipBoard from './ShortcodeCopy';
import { googleIcon } from '../../utils/icons';

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
		setStatus(__('Cancelling…', 'embed-google-photos'));
	};

	const openAuthSidebar = () =>
		wp.data
			.dispatch('core/edit-post')
			.openGeneralSidebar('bpgpb-google-photos/bpgpb-google-photos');

	if (isLoading) {
		return (
			<div {...blockProps}>
				<div className="bpgpb-loading">
					<Spinner />
					<span>{__('Checking connection…', 'embed-google-photos')}</span>
				</div>
			</div>
		);
	}

	// Not connected yet — send the admin to the authorization sidebar.
	if (!token?.connected) {
		return (
			<div {...blockProps}>
				<div className="bpgpbSelectArea bpgpb-card">
					<span className="bpgpb-card__icon">{googleIcon}</span>
					<h2 className="bpgpb-card__title">
						{__('Connect your Google Photos account', 'embed-google-photos')}
					</h2>
					<p className="bpgpb-card__desc">
						{__('Authorize the plugin to start embedding your Google Photos galleries.', 'embed-google-photos')}
					</p>
					<Button variant="primary" className="bpgpb-btn" onClick={openAuthSidebar}>
						{__('Open authorization', 'embed-google-photos')}
					</Button>
				</div>
			</div>
		);
	}

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
					/>
				</div>

				<div className={`bpgpbSelectArea${selectedPhotos.length ? ' is-compact' : ' bpgpb-card'}`}>
					{busy ? (
						<div className="bpgpb-picker-status">
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
										{__('Select photos from Google Photos', 'embed-google-photos')}
									</h2>
									<p className="bpgpb-card__desc">
										{__('Pick images and videos to display in your gallery.', 'embed-google-photos')}
									</p>
								</>
							)}
							<Button variant="primary" className="bpgpb-btn" onClick={pickPhotos}>
								{selectedPhotos.length
									? __('Change photos', 'embed-google-photos')
									: __('Select from Google Photos', 'embed-google-photos')}
							</Button>
							{status && <p className={`bpgpb-picker-note${isError ? ' is-error' : ''}`}>{status}</p>}
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Edit;
