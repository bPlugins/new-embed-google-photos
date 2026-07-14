import { __ } from '@wordpress/i18n';
import { PanelBody, TextControl } from '@wordpress/components';
import { produce } from 'immer';

/**
 * Inspector panel for editing each selected image's alt text.
 *
 * Alt text is stored per photo on the block's `selectedPhotos` attribute and is
 * used for the frontend <img alt> (accessibility) and the Schema.org ImageObject
 * name/caption (SEO). Empty entries fall back to the image title on the frontend.
 *
 * @param {Object}   props
 * @param {Array}    props.selectedPhotos Imported photos/videos.
 * @param {Function} props.setAttributes  Block attribute setter.
 */
const AltText = ({ selectedPhotos = [], setAttributes }) => {
	if (!selectedPhotos.length) {
		return null;
	}

	const updateAlt = (index, value) => {
		const next = produce(selectedPhotos, (draft) => {
			draft[index].alt = value;
		});
		setAttributes({ selectedPhotos: next });
	};

	return (
		<PanelBody title={__('Image Alt Text (SEO)', 'embed-google-photos')} initialOpen={false}>
			<p className="bpgpb-alt-hint">
				{__(
					'Describe each image for screen readers and search engines. Leave blank to use the image title.',
					'embed-google-photos'
				)}
			</p>

			<div className="bpgpb-alt-list">
				{selectedPhotos.map((photo, index) => {
					const thumb = photo.placeholder || photo.thumb || photo.url;
					return (
						<div className="bpgpb-alt-row" key={photo.id || index}>
							{thumb && (
								<img className="bpgpb-alt-thumb" src={thumb} alt="" aria-hidden="true" />
							)}
							<TextControl
								className="bpgpb-alt-input"
								value={photo.alt || ''}
								placeholder={photo.title || __('Describe this image…', 'embed-google-photos')}
								onChange={(value) => updateAlt(index, value)}
								__nextHasNoMarginBottom
							/>
						</div>
					);
				})}
			</div>
		</PanelBody>
	);
};

export default AltText;
