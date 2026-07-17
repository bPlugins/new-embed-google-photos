import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { PanelBody, FocalPointPicker, Button, ToggleControl } from '@wordpress/components';
import { produce } from 'immer';

// Self-contained placeholder (data URI) with clearly off-centre subjects — a
// person on the left, a sun upper-right — so dragging the focal point visibly
// changes what the crop preview keeps in frame. No external asset needed.
const DUMMY_IMAGE =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
			<rect width="400" height="300" fill="#e8eef7"/>
			<rect y="205" width="400" height="95" fill="#d3e4c8"/>
			<circle cx="140" cy="118" r="46" fill="#6a8fd8"/>
			<path d="M66 232 q74 -84 148 0 z" fill="#6a8fd8"/>
			<circle cx="322" cy="70" r="28" fill="#f4c430"/>
			<g stroke="#ffffff" stroke-opacity="0.45" stroke-width="2">
				<line x1="133" y1="0" x2="133" y2="300"/>
				<line x1="266" y1="0" x2="266" y2="300"/>
				<line x1="0" y1="100" x2="400" y2="100"/>
				<line x1="0" y1="200" x2="400" y2="200"/>
			</g>
		</svg>`
	);

/**
 * Inspector panel for choosing the crop focal point.
 *
 * A single focal point (stored on the `focalPoint` attribute) applies to EVERY
 * image, set quickly on a dummy placeholder with a live cropped preview beside
 * it — so authors don't have to touch every photo. An optional "per image"
 * section still lets them override individual photos (`photo.focalPoint`).
 *
 * @param {Object}   props
 * @param {Array}    props.selectedPhotos Imported photos/videos.
 * @param {Object}   props.focalPoint     Global {x,y} focal point (0–1).
 * @param {Object}   props.coverImage     Holds the gallery aspect ratio.
 * @param {Function} props.setAttributes  Block attribute setter.
 */
const FocalPoint = ({ selectedPhotos = [], focalPoint = { x: 0.5, y: 0.5 }, coverImage = {}, setAttributes }) => {
	const [perImage, setPerImage] = useState(false);

	if (!selectedPhotos.length) {
		return null;
	}

	const ratioCSS = (coverImage.ratio || '1:1').replace(':', ' / ');

	// A small box showing an image cropped to the gallery ratio at a focal point,
	// so the author sees exactly what the crop keeps in view.
	const CropPreview = ({ url, point }) => (
		<div className="bpgpb-focal-preview" style={{ aspectRatio: ratioCSS }}>
			<img
				src={url}
				alt=""
				style={{ objectPosition: `${Math.round((point.x ?? 0.5) * 100)}% ${Math.round((point.y ?? 0.5) * 100)}%` }}
			/>
		</div>
	);

	const updateGlobal = (value) => setAttributes({ focalPoint: value });

	const updatePhoto = (index, value) => {
		const next = produce(selectedPhotos, (draft) => {
			draft[index].focalPoint = value;
		});
		setAttributes({ selectedPhotos: next });
	};

	const resetPhoto = (index) => {
		const next = produce(selectedPhotos, (draft) => {
			delete draft[index].focalPoint;
		});
		setAttributes({ selectedPhotos: next });
	};

	return (
		<PanelBody title={__('Focal Point (Crop)', 'embed-google-photos')} initialOpen={false}>
			<p className="bpgpb-alt-hint">
				{__('Drag the point to choose which part of the image stays in view when cropped. This applies to every image in the gallery.', 'embed-google-photos')}
			</p>

			<div className="bpgpb-focal-global">
				<FocalPointPicker
					url={DUMMY_IMAGE}
					value={focalPoint}
					onChange={updateGlobal}
					__nextHasNoMarginBottom
				/>
				<div className="bpgpb-focal-preview-wrap">
					<span className="bpgpb-focal-preview-label">{__('Crop preview', 'embed-google-photos')}</span>
					<CropPreview url={DUMMY_IMAGE} point={focalPoint} />
				</div>
			</div>

			{(focalPoint.x !== 0.5 || focalPoint.y !== 0.5) && (
				<Button
					variant="link"
					isDestructive
					className="bpgpb-focal-reset"
					onClick={() => updateGlobal({ x: 0.5, y: 0.5 })}
				>
					{__('Reset to center', 'embed-google-photos')}
				</Button>
			)}

			<ToggleControl
				className="mt20"
				label={__('Fine-tune per image', 'embed-google-photos')}
				help={__('Override the focal point for specific photos.', 'embed-google-photos')}
				checked={perImage}
				onChange={setPerImage}
				__nextHasNoMarginBottom
			/>

			{perImage && (
				<div className="bpgpb-focal-list mt10">
					{selectedPhotos.map((photo, index) => {
						// Videos are letterboxed (object-fit: contain) — no crop effect.
						if ('video' === photo.type) {
							return null;
						}
						const url = photo.thumb || photo.url || photo.placeholder;
						if (!url) {
							return null;
						}
						const value = photo.focalPoint || focalPoint;
						const isCustom = !!photo.focalPoint;

						return (
							<div className="bpgpb-focal-row" key={photo.id || index}>
								<FocalPointPicker
									url={url}
									value={value}
									onChange={(val) => updatePhoto(index, val)}
									__nextHasNoMarginBottom
								/>
								{isCustom && (
									<Button
										variant="link"
										isDestructive
										className="bpgpb-focal-reset"
										onClick={() => resetPhoto(index)}
									>
										{__('Use global focal point', 'embed-google-photos')}
									</Button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</PanelBody>
	);
};

export default FocalPoint;
