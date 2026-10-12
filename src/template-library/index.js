import { subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
// From @wordpress/element, not react-dom/client: the subpath isn't externalised and would bundle a second React.
import { createRoot } from '@wordpress/element';

import './style.scss';
import TemplateLibrary from './TemplateLibrary';

// Toolbar selectors, newest first; the header fallbacks cover reduced toolbars (e.g. the bpgpb_gallery screen).
const TOOLBARS = [
	'.editor-document-tools',
	'.editor-header__toolbar',
	'.edit-post-header-toolbar',
	'.editor-header__center',
	'.editor-header',
	'.edit-post-header'
];

// The shared modal needs the wp.ajax global (wp-util); wait for it rather than crash on first render.
const whenAjaxReady = (run) => {
	if (window.wp?.ajax) {
		run();
		return;
	}

	let waited = 0;
	const timer = setInterval(() => {
		waited += 100;

		if (window.wp?.ajax || waited >= 10000) {
			clearInterval(timer);
			run();
		}
	}, 100);
};

const mountTemplateLibrary = () => {
	const wrap = document.createElement('div');

	wrap.classList.add('bpgpbTemplateLibrary');
	whenAjaxReady(() => createRoot(wrap).render(<TemplateLibrary />));

	// React rebuilds the toolbar on its own schedule, so re-place the button on every mutation / store change.
	const place = () => {
		if (wrap.isConnected) {
			return;
		}

		for (const selector of TOOLBARS) {
			const toolbar = document.querySelector(selector);

			if (toolbar) {
				toolbar.appendChild(wrap);
				return;
			}
		}
	};

	new MutationObserver(place).observe(document.body, { childList: true, subtree: true });
	subscribe(place);
	place();
};

domReady(mountTemplateLibrary);
