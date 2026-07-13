import { useEffect, useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { PanelBody, Button, Spinner, __experimentalInputControl as InputControl } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import useWPAjax from './utils/useWPAjax';
import { blockIcon, googleIcon } from './utils/icons';

const bpgpbEvent = new CustomEvent('bpgpbEventEdit');

const RenderPlugin = () => {
	const [bpgpbData, setbpgpbData] = useState({});
	const { client_id = '', client_secret = '', refresh_token = '' } = bpgpbData || {};

	const [errors, setErrors] = useState({});
	const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }
	const [pending, setPending] = useState(false);
	const wasDisconnect = useRef(false);

	// Fetch existing credentials on load.
	const { data: token = null, isLoading, isError, error, saveData } = useWPAjax(
		'retrieve_refresh_token',
		{ nonce: window.wpApiSettings?.nonce }
	);

	// Populate the fields from the saved credentials ONCE (first load only), so a
	// save-triggered refetch never overwrites what the user is typing.
	const initialized = useRef(false);
	useEffect(() => {
		if (!isLoading && token && !initialized.current) {
			setbpgpbData(token);
			initialized.current = true;
		}
	}, [isLoading, token]);

	// Let the editor block re-check the connection after a save.
	useEffect(() => {
		if (!isLoading && token) {
			window.dispatchEvent(bpgpbEvent);
		}
	}, [isLoading]);

	// Report the result once a save finishes.
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
		} else {
			setNotice({
				type: 'success',
				text: wasDisconnect.current
					? __('Disconnected. Your credentials were removed.', 'embed-google-photos')
					: __('Connected! Your Google Photos account is ready.', 'embed-google-photos'),
			});
		}
	}, [isLoading, pending]);

	const setField = (key) => (val) => {
		setbpgpbData({ ...bpgpbData, [key]: val || '' });
		if (errors[key]) {
			setErrors({ ...errors, [key]: undefined });
		}
	};

	const saveInformation = () => {
		setNotice(null);

		const cid = client_id.trim();
		const cs = client_secret.trim();
		const rt = refresh_token.trim();

		// All three empty + save => intentional disconnect.
		if (!cid && !cs && !rt) {
			setErrors({});
			wasDisconnect.current = true;
			setPending(true);
			saveData({ client_id: '', client_secret: '', refresh_token: '', save: true });
			return;
		}

		const nextErrors = {};
		if (!cid) {
			nextErrors.client_id = __('Client ID is required.', 'embed-google-photos');
		} else if (!/\.apps\.googleusercontent\.com$/i.test(cid)) {
			nextErrors.client_id = __('This usually ends with ".apps.googleusercontent.com".', 'embed-google-photos');
		}
		if (!cs) {
			nextErrors.client_secret = __('Client Secret is required.', 'embed-google-photos');
		}
		if (!rt) {
			nextErrors.refresh_token = __('Refresh Token is required.', 'embed-google-photos');
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

	const field = (key, label, value, placeholder) => (
		<div className={`bpgpb-field${errors[key] ? ' has-error' : ''}`}>
			<InputControl
				label={label}
				labelPosition="top"
				value={value}
				placeholder={placeholder}
				onChange={setField(key)}
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

						{notice && (
							<div className={`bpgpb-notice bpgpb-notice--${notice.type}`}>
								{notice.text}
							</div>
						)}

						{field('client_id', __('Client ID', 'embed-google-photos'), client_id, 'xxxxxx.apps.googleusercontent.com')}
						{field('client_secret', __('Client Secret', 'embed-google-photos'), client_secret, 'GOCSPX-…')}
						{field('refresh_token', __('Refresh Token', 'embed-google-photos'), refresh_token, '1//0…')}

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
							) : (
								__('Save Information', 'embed-google-photos')
							)}
						</Button>

						<p className="bpgpb-auth-hint">
							{__('Tip: clear all fields and save to disconnect your account.', 'embed-google-photos')}
						</p>
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
