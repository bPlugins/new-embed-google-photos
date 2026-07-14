import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { produce } from 'immer';

/**
 * Inspector panel that lets the user drag the selected photos into a new order.
 *
 * Order is stored as the order of the block's `selectedPhotos` attribute, which
 * is exactly the order the gallery renders in (editor + frontend). Reordering
 * here therefore reorders the gallery everywhere with no other wiring.
 *
 * Uses the native HTML5 drag-and-drop API so it adds no dependency and stays
 * self-contained (this file + a small hook-up in Settings.js + editor styles).
 *
 * @param {Object}   props
 * @param {Array}    props.selectedPhotos Imported photos/videos.
 * @param {Function} props.setAttributes  Block attribute setter.
 */
const ReorderPhotos = ({ selectedPhotos = [], setAttributes }) => {
	// Index being dragged, and the index it is currently hovering over.
	const [dragIndex, setDragIndex] = useState(null);
	const [overIndex, setOverIndex] = useState(null);

	if (selectedPhotos.length < 2) {
		return null;
	}

	const move = (from, to) => {
		if (from === to || from == null || to == null) {
			return;
		}
		const next = produce(selectedPhotos, (draft) => {
			const [item] = draft.splice(from, 1);
			draft.splice(to, 0, item);
		});
		setAttributes({ selectedPhotos: next });
	};

	const onDrop = (to) => {
		move(dragIndex, to);
		setDragIndex(null);
		setOverIndex(null);
	};

	return (
		<PanelBody title={__('Reorder Photos', 'embed-google-photos')} initialOpen={false}>
			<p className="bpgpb-reorder-hint">
				{__('Drag the thumbnails to change the order photos appear in the gallery.', 'embed-google-photos')}
			</p>

			<div className="bpgpb-reorder-grid">
				{selectedPhotos.map((photo, index) => {
					const thumb = photo.placeholder || photo.thumb || photo.url;
					const isVideo = 'video' === photo.type;
					const classes = [
						'bpgpb-reorder-item',
						dragIndex === index ? 'is-dragging' : '',
						overIndex === index && dragIndex !== index ? 'is-over' : '',
					].filter(Boolean).join(' ');

					return (
						<div
							key={photo.id || index}
							className={classes}
							draggable
							onDragStart={() => setDragIndex(index)}
							onDragEnter={() => setOverIndex(index)}
							onDragOver={(e) => e.preventDefault()}
							onDrop={() => onDrop(index)}
							onDragEnd={() => {
								setDragIndex(null);
								setOverIndex(null);
							}}
							title={photo.title || ''}
							aria-label={
								/* translators: %d: photo position in the gallery */
								`${__('Photo', 'embed-google-photos')} ${index + 1}`
							}
						>
							{thumb && (
								<img className="bpgpb-reorder-thumb" src={thumb} alt="" aria-hidden="true" />
							)}
							<span className="bpgpb-reorder-index">{index + 1}</span>
							{isVideo && <span className="bpgpb-reorder-badge" aria-hidden="true">▶</span>}
						</div>
					);
				})}
			</div>
		</PanelBody>
	);
};

export default ReorderPhotos;
