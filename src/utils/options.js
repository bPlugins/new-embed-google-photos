import { __ } from '@wordpress/i18n';

import { verticalLineIcon, horizontalLineIcon } from './icons';

export const layoutShowOpt = [
	{ label: __('Photos', 'embed-google-photos'), value: 'photos' },
	{ label: __('Album List', 'embed-google-photos'), value: 'albums' },
]

export const ratioOpt = [
	{ label: __('16:9 - Landscape', 'embed-google-photos'), value: '16:9' },
	{ label: __('4:3 - Horizontal', 'embed-google-photos'), value: '4:3' },
	{ label: __('1:1 - Square', 'embed-google-photos'), value: '1:1' },
	{ label: __('3:4 - Vertical', 'embed-google-photos'), value: '3:4' },
	{ label: __('9:16 - Potrait', 'embed-google-photos'), value: '9:16' },
]

export const mediaTypeOpt = [
	{ label: __('All Media', 'embed-google-photos'), value: 'all_media' },
	{ label: __('Photos', 'embed-google-photos'), value: 'photo' },
	{ label: __('Videos', 'embed-google-photos'), value: 'video' }
]

export const layoutOpt = [
	{ label: __('Grid', 'embed-google-photos'), value: 'grid' },
	{ label: __('Masonry', 'embed-google-photos'), value: 'masonry' },
	{ label: __('Carousel', 'embed-google-photos'), value: 'carousel' }
]

export const hoverEffectOpt = [
	{ label: __('None', 'embed-google-photos'), value: 'none' },
	{ label: __('Zoom', 'embed-google-photos'), value: 'zoom' },
	{ label: __('Overlay', 'embed-google-photos'), value: 'overlay' },
	{ label: __('Caption Slide-in', 'embed-google-photos'), value: 'slide' }
]

export const captionSourceOpt = [
	{ label: __('Title', 'embed-google-photos'), value: 'title' },
	{ label: __('Date', 'embed-google-photos'), value: 'date' }
]

export const captionPositionOpt = [
	{ label: __('Below Image', 'embed-google-photos'), value: 'below' },
	{ label: __('Overlay (on hover)', 'embed-google-photos'), value: 'overlay' }
]

export const paginationOpt = [
	{ label: __('Show All', 'embed-google-photos'), value: 'none' },
	{ label: __('Load More', 'embed-google-photos'), value: 'load_more' },
	{ label: __('Pagination', 'embed-google-photos'), value: 'pagination' }
]

export const favoriteOpt = [
	{ label: __('All', 'embed-google-photos'), value: 'none' },
	{ label: __('FAVORITES', 'embed-google-photos'), value: 'favorites' },
]

export const photosOpt = [
	{ label: __('All Photos', 'embed-google-photos'), value: 'photos' },
	{ label: __('Albums', 'embed-google-photos'), value: 'albums' },
	{ label: __('Favorites', 'embed-google-photos'), value: 'favorite' },
]

export const layouts = [
	{ label: __('Vertical', 'embed-google-photos'), value: 'vertical', icon: verticalLineIcon },
	{ label: __('Horizontal', 'embed-google-photos'), value: 'horizontal', icon: horizontalLineIcon }
];

export const generalStyleTabs = [
	{ name: 'general', title: __('General', 'embed-google-photos') },
	{ name: 'style', title: __('Style', 'embed-google-photos') }
];