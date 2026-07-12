import './style.scss';

// Photos are server-rendered from the Media Library. Here we only attach the
// Fancybox lightbox to the rendered gallery links.
const initLightbox = () => {
	if (typeof Fancybox === 'undefined') {
		return;
	}
	Fancybox.bind('[data-fancybox^="bpgpb-"]', {
		Thumbs: false,
		contentClick: 'toggleZoom',
	});
};

document.addEventListener('DOMContentLoaded', initLightbox);
