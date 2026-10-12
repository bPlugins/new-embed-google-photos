import { __, sprintf } from '@wordpress/i18n';
import { videos } from '../../admin/utils/data';

/**
 * "▶" link to a short YouTube video about a feature, opened in a new tab.
 *
 * It can sit in a panel title, so its click is kept from toggling the panel.
 *
 * @param {Object} props
 * @param {string} props.url   YouTube watch URL.
 * @param {string} props.title Feature name, for the screen-reader label.
 */
export const VideoTip = ({ url, title }) => (
	<a
		className="bpgpb-video-tip"
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		title={__('Watch a short video (opens YouTube)', 'embed-google-photos')}
		aria-label={sprintf(/* translators: %s: feature name */ __('Watch a video: %s (opens in a new tab)', 'embed-google-photos'), title)}
		onClick={(e) => e.stopPropagation()}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" /></svg>
	</a>
);

/**
 * Small "▶ <topic> · 25 sec" link at the bottom of a settings panel; opens the
 * feature's YouTube video in a new tab.
 *
 * @param {Object} props
 * @param {string} props.topic Key in `videos`.
 */
export const VideoRow = ({ topic }) => {
	// [label, video length in seconds]
	const topics = {
		layouts: [__('Gallery layouts', 'embed-google-photos'), 27],
		lightbox: [__('Lightbox', 'embed-google-photos'), 25],
		search: [__('Live search & filters', 'embed-google-photos'), 25],
		photosVideos: [__('Photos & videos', 'embed-google-photos'), 25],
		hover: [__('Hover, filters & motion', 'embed-google-photos'), 25],
		pagination: [__('Pagination & sorting', 'embed-google-photos'), 25],
		carousel: [__('Carousels & sliders', 'embed-google-photos'), 25],
		responsiveSeo: [__('Responsive & SEO', 'embed-google-photos'), 25],
		delivery: [__('Client delivery & protection', 'embed-google-photos'), 25],
	};
	const [label, seconds] = topics[topic];
	return (
		<p className="bpgpb-video-row">
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" /></svg>
			<a
				href={videos[topic]}
				target="_blank"
				rel="noopener noreferrer"
				title={__('Watch video (opens YouTube)', 'embed-google-photos')}
				aria-label={sprintf(/* translators: %s: feature name */ __('Watch video: %s (opens in a new tab)', 'embed-google-photos'), label)}
			>
				{sprintf(/* translators: 1: feature name, 2: video length in seconds */ __('%1$s · %2$d sec', 'embed-google-photos'), label, seconds)}
			</a>
		</p>
	);
};
