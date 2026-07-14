import { useEffect, useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { PanelBody, Button, Spinner, __experimentalInputControl as InputControl } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import useWPAjax from '../../utils/useWPAjax';
import { blockIcon, googleIcon } from '../../utils/icons';

const bpgpbEvent = new CustomEvent('bpgpbEventEdit');

const RenderPlugin = () => {
	// Credentials are write-only: the server never sends the saved Client ID,
	// Client Secret or Refresh Token back to the browser. We only ever learn
	// whether the site is currently connected, and hold the input values in
	// local state until the admin saves them.
	const [fields, setFields] = useState({ client_id: '', client_secret: '', refresh_token: '' });
	const { client_id = '', client_secret = '', refresh_token = '' } = fields;

	const [connected, setConnected] = useState(false);
	const [errors, setErrors] = useState({});
	const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }
	const [pending, setPending] = useState(false);
	const wasDisconnect = useRef(false);

	// Fetch the connection status on load (returns only { connected }).
	const { data: status = null, isLoading, isError, error, saveData } = useWPAjax(
		'bpgpb_retrieve_refresh_token',
		{ nonce: window.wpApiSettings?.nonce }
	);

	// Reflect the latest connection status from the server.
	useEffect(() => {
		if (!isLoading && status && typeof status.connected !== 'undefined') {
			setConnected(!!status.connected);
		}
	}, [isLoading, status]);

	// Let the editor block re-check the connection after the status is known.
	useEffect(() => {
		if (!isLoading && status) {
			window.dispatchEvent(bpgpbEvent);
		}
	}, [isLoading]);

	// Report the result once a save/disconnect finishes.
	useEffect(() => {
		if (!pending || isLoading) {
			return;
		}
		setPending(false);
		if (isError) {
			const text =
				(typeof error === 'string' && error) ||
				error?.message ||
				__('We could not verify your credentials. Please double-check them and try again.', 'embed-google-photos');
			setNotice({ type: 'error', text });
			return;
		}
		// Success: clear the entered secrets from memory and update the UI.
		setFields({ client_id: '', client_secret: '', refresh_token: '' });
		setConnected(!!(status && status.connected));
		setNotice({
			type: 'success',
			text: wasDisconnect.current
				? __('Disconnected. Your credentials were removed.', 'embed-google-photos')
				: __('Connected! Your Google Photos account is ready.', 'embed-google-photos'),
		});
	}, [isLoading, pending]);

	const setField = (key) => (val) => {
		setFields((prev) => ({ ...prev, [key]: val || '' }));
		if (errors[key]) {
			setErrors({ ...errors, [key]: undefined });
		}
	};

	const disconnect = () => {
		setNotice(null);
		setErrors({});
		wasDisconnect.current = true;
		setPending(true);
		saveData({ save: true, disconnect: true });
	};

	const saveInformation = () => {
		setNotice(null);

		const cid = client_id.trim();
		const cs = client_secret.trim();
		const rt = refresh_token.trim();

		const nextErrors = {};

		// When already connected, blank fields mean "keep the stored value", so
		// only validate the fields the admin actually filled in. When not yet
		// connected, all three are required.
		if (!connected) {
			if (!cid) {
				nextErrors.client_id = __('Client ID is required.', 'embed-google-photos');
			}
			if (!cs) {
				nextErrors.client_secret = __('Client Secret is required.', 'embed-google-photos');
			}
			if (!rt) {
				nextErrors.refresh_token = __('Refresh Token is required.', 'embed-google-photos');
			}
		}
		if (cid && !/\.apps\.googleusercontent\.com$/i.test(cid)) {
			nextErrors.client_id = __('This usually ends with ".apps.googleusercontent.com".', 'embed-google-photos');
		}

		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) {
			setNotice({ type: 'error', text: __('Please fix the highlighted fields below.', 'embed-google-photos') });
			return;
		}

		wasDisconnect.current = false;
		setPending(true);
		saveData({ client_id: cid, client_secret: cs, refresh_token: rt, save: true });
	};

	const field = (key, label, placeholder) => (
		<div className={`bpgpb-field${errors[key] ? ' has-error' : ''}`}>
			<InputControl
				label={label}
				labelPosition="top"
				value={fields[key]}
				placeholder={placeholder}
				onChange={setField(key)}
				type={key === 'client_id' ? 'text' : 'password'}
				autoComplete="off"
			/>
			{errors[key] && <p className="bpgpb-field-error">{errors[key]}</p>}
		</div>
	);

	return (
		<>
			<PluginSidebarMoreMenuItem target="bpgpb-google-photos">
				{__('Google Photos Block', 'embed-google-photos')}
			</PluginSidebarMoreMenuItem>

			<PluginSidebar className="bPlPluginSidebar" name="bpgpb-google-photos" title={__('Google Photos', 'embed-google-photos')}>
				<PanelBody className="bPlPanelBody bpgpbPanelBody" title={__('Authorization', 'embed-google-photos')} initialOpen={true}>
					<div className="gpAuthorization">
						<div className="bpgpb-auth-head">
							<span className="bpgpb-auth-head__icon">{googleIcon}</span>
							<p className="bpgpb-auth-head__text">
								{__('Enter your Google API credentials to connect your account.', 'embed-google-photos')}
								{' '}
								<a target="_blank" rel="noreferrer" href="https://bplugins.com/docs/embed-google-photos/guides/">
									{__('Need help?', 'embed-google-photos')}
								</a>
							</p>
						</div>

						{connected && (
							<div className="bpgpb-notice bpgpb-notice--success">
								{__('✓ Connected. For your security, saved credentials are never shown again — leave a field blank to keep it, or re-enter to replace it.', 'embed-google-photos')}
							</div>
						)}

						{notice && (
							<div className={`bpgpb-notice bpgpb-notice--${notice.type}`}>
								{notice.text}
							</div>
						)}

						{field('client_id', __('Client ID', 'embed-google-photos'), connected ? '•••••• (saved)' : 'xxxxxx.apps.googleusercontent.com')}
						{field('client_secret', __('Client Secret', 'embed-google-photos'), connected ? '•••••• (saved)' : 'GOCSPX-…')}
						{field('refresh_token', __('Refresh Token', 'embed-google-photos'), connected ? '•••••• (saved)' : '1//0…')}

						<Button
							variant="primary"
							className="bpgpb-btn bpgpb-btn--full"
							onClick={saveInformation}
							isBusy={pending}
							disabled={pending}
						>
							{pending ? (
								<>
									<Spinner />
									{__('Saving…', 'embed-google-photos')}
								</>
							) : connected ? (
								__('Update Credentials', 'embed-google-photos')
							) : (
								__('Save Information', 'embed-google-photos')
							)}
						</Button>

						{connected && (
							<Button
								variant="secondary"
								isDestructive
								className="bpgpb-btn bpgpb-btn--full"
								onClick={disconnect}
								disabled={pending}
							>
								{__('Disconnect account', 'embed-google-photos')}
							</Button>
						)}
					</div>
				</PanelBody>
			</PluginSidebar>
		</>
	);
};

registerPlugin('bpgpb-google-photos', {
	icon: blockIcon,
	render: RenderPlugin,
});
