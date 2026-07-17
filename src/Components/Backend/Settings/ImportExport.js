import { __ } from '@wordpress/i18n';
import { useRef, useState } from 'react';
import { PanelBody, Button, TextareaControl, Notice } from '@wordpress/components';

// Content-specific attributes that describe THIS gallery's photos, not its
// design — never exported/imported so styles copy cleanly between galleries.
const EXCLUDE_KEYS = ['selectedPhotos', 'photosType', 'favorite', 'albumId', 'album', 'syncUrl', 'autoSync'];

/**
 * Import / Export inspector panel.
 *
 * Exports every styling & layout attribute (everything except the photo/content
 * keys in EXCLUDE_KEYS) as JSON so a gallery's look can be copied to another
 * block or another site, and imports the same JSON back onto the block.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    All block attributes.
 * @param {Function} props.setAttributes Block attribute setter.
 */
const ImportExport = ({ attributes, setAttributes }) => {
	const [importText, setImportText] = useState('');
	const [notice, setNotice] = useState(null); // { type, msg }
	const fileRef = useRef(null);

	// Build the design-only config object (drops the photo/content keys).
	const config = {};
	Object.keys(attributes).forEach((key) => {
		if (!EXCLUDE_KEYS.includes(key)) {
			config[key] = attributes[key];
		}
	});
	const exportJSON = JSON.stringify(config, null, 2);

	const copyJSON = () => {
		if (navigator.clipboard?.writeText) {
			navigator.clipboard.writeText(exportJSON)
				.then(() => setNotice({ type: 'success', msg: __('Settings copied to clipboard.', 'embed-google-photos') }))
				.catch(() => setNotice({ type: 'error', msg: __('Could not copy — select the text and copy manually.', 'embed-google-photos') }));
		} else {
			setNotice({ type: 'error', msg: __('Clipboard unavailable — select the text and copy manually.', 'embed-google-photos') });
		}
	};

	const downloadJSON = () => {
		const blob = new Blob([exportJSON], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'gallery-config.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// Parse JSON text and apply it, silently dropping any content keys so an
	// export that included them can never overwrite this gallery's photos.
	const applyJSON = (text) => {
		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch (e) {
			setNotice({ type: 'error', msg: __('Invalid JSON — please check the text and try again.', 'embed-google-photos') });
			return;
		}
		if (!parsed || 'object' !== typeof parsed || Array.isArray(parsed)) {
			setNotice({ type: 'error', msg: __('This does not look like a gallery configuration.', 'embed-google-photos') });
			return;
		}
		const clean = {};
		Object.keys(parsed).forEach((key) => {
			if (!EXCLUDE_KEYS.includes(key)) {
				clean[key] = parsed[key];
			}
		});
		setAttributes(clean);
		setImportText('');
		setNotice({ type: 'success', msg: __('Settings imported.', 'embed-google-photos') });
	};

	const onFile = (e) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => applyJSON(String(reader.result || ''));
		reader.readAsText(file);
		// Reset so selecting the same file again re-fires onChange.
		e.target.value = '';
	};

	return (
		<PanelBody title={__('Import / Export', 'embed-google-photos')} initialOpen={false}>
			<p className="bpgpb-alt-hint">
				{__('Copy this gallery\'s styling & layout as JSON to reuse on another gallery or site. Your photos are not included.', 'embed-google-photos')}
			</p>

			{notice && (
				<Notice status={notice.type} isDismissible onRemove={() => setNotice(null)} className="mb10">
					{notice.msg}
				</Notice>
			)}

			<TextareaControl
				className="bpgpb-ie-textarea"
				label={__('Export', 'embed-google-photos')}
				value={exportJSON}
				readOnly
				rows={6}
				onChange={() => {}}
				__nextHasNoMarginBottom
			/>
			<div className="bpgpb-ie-actions">
				<Button variant="secondary" onClick={copyJSON}>{__('Copy', 'embed-google-photos')}</Button>
				<Button variant="secondary" onClick={downloadJSON}>{__('Download .json', 'embed-google-photos')}</Button>
			</div>

			<hr className="bpgpb-ie-sep" />

			<TextareaControl
				className="bpgpb-ie-textarea mt10"
				label={__('Import', 'embed-google-photos')}
				placeholder={__('Paste gallery configuration JSON here…', 'embed-google-photos')}
				value={importText}
				rows={6}
				onChange={(val) => setImportText(val)}
				__nextHasNoMarginBottom
			/>
			<div className="bpgpb-ie-actions">
				<Button variant="primary" onClick={() => applyJSON(importText)} disabled={!importText.trim()}>
					{__('Import', 'embed-google-photos')}
				</Button>
				<Button variant="secondary" onClick={() => fileRef.current?.click()}>
					{__('Upload .json', 'embed-google-photos')}
				</Button>
				<input
					ref={fileRef}
					type="file"
					accept="application/json,.json"
					onChange={onFile}
					style={{ display: 'none' }}
				/>
			</div>
		</PanelBody>
	);
};

export default ImportExport;
