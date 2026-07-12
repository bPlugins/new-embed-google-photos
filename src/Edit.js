import { useState } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import useWPAjax from './hooks/useWPAjax';
import { runPicker } from './picker';

const Edit = (props) => {
	const { attributes, setAttributes, clientId } = props;
	const { selectedPhotos = [] } = attributes;

	const blockProps = useBlockProps({ id: `BPGPBBlockDirectory-${clientId}` });

	// Connection check (admin-only handler). Presence of an access token means
	// the site owner has connected their Google credentials.
	const { isLoading, data: token } = useWPAjax('bpgpb_retrieve_access_token', {
		nonce: window.wpApiSettings?.nonce,
	});

	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState('');

	const pickPhotos = async () => {
		setBusy(true);
		setStatus('');
		try {
			const photos = await runPicker(window.wpApiSettings?.nonce, setStatus);
			if (photos.length) {
				setAttributes({ selectedPhotos: photos });
			} else {
				setStatus(__('No photos were selected.', 'embed-google-photos'));
			}
		} catch (e) {
			setStatus(
				(e && e.message) ||
					__('Something went wrong. Please try again.', 'embed-google-photos')
			);
		}
		setBusy(false);
	};

	if (isLoading) {
		return (
			<div {...blockProps}>
				<div className="loadingIcon">
					<Spinner />
				</div>
			</div>
		);
	}

	// Not connected yet — send the admin to the authorization sidebar.
	if (!token?.access_token) {
		return (
			<div {...blockProps}>
				<div className="bpgpbSelectArea">
					<h2>{__('Connect your Google Photos account', 'embed-google-photos')}</h2>
					<Button
						variant="primary"
						onClick={() =>
							wp.data
								.dispatch('core/edit-post')
								.openGeneralSidebar(
									'bpgpb-google-photos/bpgpb-google-photos'
								)
						}
					>
						{__('Open authorization', 'embed-google-photos')}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div {...blockProps}>
				{selectedPhotos.length > 0 && (
					<div className="bpgpb-editor-grid">
						{selectedPhotos.map((photo, index) => (
							<div className="bpgpb-editor-item" key={photo.id || index}>
								<img src={photo.thumb || photo.url} alt="" />
							</div>
						))}
					</div>
				)}

				<div className="bpgpbSelectArea">
					{busy ? (
						<div className="bpgpb-picker-status">
							<Spinner />
							<span>{status}</span>
						</div>
					) : (
						<>
							<Button variant="primary" onClick={pickPhotos}>
								{selectedPhotos.length
									? __('Change photos', 'embed-google-photos')
									: __('Select from Google Photos', 'embed-google-photos')}
							</Button>
							{status && <p className="bpgpb-picker-note">{status}</p>}
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Edit;
