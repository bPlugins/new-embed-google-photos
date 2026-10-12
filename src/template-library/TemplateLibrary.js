import { __ } from '@wordpress/i18n';
import { useState, useRef, useLayoutEffect } from '@wordpress/element';

import BPLTemplateLibrary from '../../../bpl-tools/TemplateLibrary';

import { blockIcon } from '../utils/icons';

// Endpoints live in includes/templates.php (proxy to templates.bplugins.com); globals come from enqueueTemplateLibrary().

// Placeholder button: the shared component fetches on mount, so nothing is requested until it's clicked.
const TemplateLibrary = () => {
	const [opened, setOpened] = useState(false);

	if (!opened) {
		return <button className='bPlTemplatesButton' onClick={() => setOpened(true)}>
			{blockIcon}
			{__('Gallery Templates', 'embed-google-photos')}
		</button>;
	}

	return <Library />;
};

// The shared modal starts closed and takes no "open" prop, so press its button once on mount.
const Library = () => {
	const nonce = typeof bpgpbTemplateNonce !== 'undefined' ? bpgpbTemplateNonce : '';
	const ref = useRef();

	useLayoutEffect(() => {
		ref.current?.querySelector('.bPlTemplatesButton')?.click();
	}, []);

	return <div ref={ref} style={{ display: 'contents' }}><BPLTemplateLibrary
		prefix='bpgpb'
		logo={blockIcon}
		buttonLabel={__('Gallery Templates', 'embed-google-photos')}
		modalTitle={__('Gallery Templates', 'embed-google-photos')}

		// A template is always one gallery block, so one tab.
		types={['patterns']}
		perPage={9}

		pricingUrl='https://bplugins.com/products/embed-google-photos/pricing/'

		ajaxActionMain='bpgpb_templates_main'
		ajaxActionTemplates='bpgpb_templates'
		ajaxActionImport='bpgpb_template_import'
		ajaxActionCounts='bpgpb_template_counts'

		nonce={nonce}
		// Free build: cards in the "pro" category show as locked.
		isPremium={false}
	/></div>;
};

export default TemplateLibrary;
