import { createRoot } from 'react-dom/client';

import Gallery from './Components/Frontend/Gallery';
import Style from './Components/Common/Style';
import './style.scss';

// Each block wrapper carries its attributes as JSON. We rehydrate the same
// Gallery component used in the editor so every setting renders identically.
document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.wp-block-bpgpb-google-photos');

	blocks.forEach((block) => {
		if (!block.dataset.attributes) {
			return;
		}

		let attributes = {};
		try {
			attributes = JSON.parse(block.dataset.attributes);
		} catch (e) {
			return;
		}

		createRoot(block).render(
			<>
				<Style attributes={attributes} cId={attributes.cId} />
				<Gallery attributes={attributes} cId={attributes.cId} />
			</>
		);

		block.removeAttribute('data-attributes');
	});
});
