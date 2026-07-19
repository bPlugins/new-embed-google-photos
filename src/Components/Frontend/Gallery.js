import { useEffect, useRef, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Fancybox } from '@fancyapps/ui';
import Plyr from 'plyr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'plyr/dist/plyr.css';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import BlurImage from './BlurImage';
import { searchIcons, micIcon } from '../../utils/icons';

// Browser Speech Recognition constructor (Chrome/Edge/Safari ship it prefixed).
// Resolved once at module load; null where the browser has no support.
const SpeechRecognition =
	typeof window !== 'undefined'
		? window.SpeechRecognition || window.webkitSpeechRecognition
		: null;

// Play triangle shown over video thumbnails.
const playIcon = (
	<svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
		<circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
		<path d="M9.5 7.5v9l7-4.5-7-4.5z" fill="#fff" />
	</svg>
);

/**
 * Shared gallery rendered in BOTH the editor preview and the frontend.
 *
 * @param {Object}  props.attributes Block attributes.
 * @param {string}  props.cId        Stable client id used to scope styles + group the lightbox.
 * @param {boolean} props.isBackend  True when rendered inside the block editor iframe.
 * @param {Function} [props.setAttributes] Block attribute setter (editor only) — lets
 *                                         empty states offer a recovery action.
 */
const Gallery = ({ attributes, cId, isBackend = false, setAttributes }) => {
	const {
		selectedPhotos = [],
		columns = {},
		columnGap,
		rowGap,
		coverImage = {},
		focalPoint: globalFocalPoint,
		mediaType = 'all_media',
		layout = 'grid',
		hoverEffect = 'none',
		carousel = {},
		caption = {},
		lightbox = {},
		video = {},
		paginationType = 'load_more',
		perPage = 9,
		loadMoreText = 'Load More',
		showSearch = false,
		searchPlaceholder = '',
		searchAlign = 'left',
		searchIcon,
		searchStyle = 'classic',
		showVoiceSearch = true,
		searchAutocomplete = false,
		searchHighlight = false,
		searchResultCount = false,
		searchChips = false,
		kenBurns = false,
		kenBurnsSpeed = 12,
		metaOverlay = false,
		showSort = false,
		previewLimit = 0,
		showCountBadge = false,
		deepLink = false,
		lightboxShare = false,
	} = attributes;
	const [sortOrder, setSortOrder] = useState('default');
	const [showAll, setShowAll] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchExpanded, setIsSearchExpanded] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [activeSuggestion, setActiveSuggestion] = useState(-1);
	const [activeYear, setActiveYear] = useState(null);
	const searchInputRef = useRef(null);
	const recognitionRef = useRef(null);

	// Voice search is offered only when the block enables it AND the browser
	// exposes the Web Speech API. In the editor we skip it — recognition would
	// pop a live mic-permission prompt while the author is just configuring.
	const voiceEnabled = showVoiceSearch && !!SpeechRecognition && !isBackend;

	// Start / stop dictation. Recognition writes the transcript straight into
	// the search query, so results filter as soon as the user stops speaking.
	const toggleVoiceSearch = () => {
		if (!SpeechRecognition) {
			return;
		}
		// Already listening — stop and let the `end` handler reset state.
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.lang = document.documentElement.lang || 'en-US';
		recognition.interimResults = true;
		recognition.continuous = false;
		recognition.maxAlternatives = 1;

		recognition.onresult = (event) => {
			const transcript = Array.from(event.results)
				.map((result) => result[0].transcript)
				.join('')
				.trim();
			setSearchQuery(transcript);
			if ('expandable' === searchStyle) {
				setIsSearchExpanded(true);
			}
		};
		recognition.onerror = () => {
			setIsListening(false);
			recognitionRef.current = null;
		};
		recognition.onend = () => {
			setIsListening(false);
			recognitionRef.current = null;
		};

		try {
			recognition.start();
			recognitionRef.current = recognition;
			setIsListening(true);
		} catch (e) {
			// start() throws if called while already active — ignore.
			setIsListening(false);
			recognitionRef.current = null;
		}
	};
	const searchIconRender = searchIcons[searchIcon || 'search-1'] || searchIcons['search-1'];
	const wrapRef = useRef();
	const prevRef = useRef();
	const nextRef = useRef();
	// Caches the "random" sort order so it is reshuffled only when the photo set
	// changes — never on unrelated re-renders (e.g. changing a setting in the
	// editor), which otherwise reshuffled the gallery on every render.
	const randomOrderRef = useRef({ sig: '', order: [] });
	const isCarousel = 'carousel' === layout;
	const isMemories = 'memories' === layout;

	// Fancybox grouping key — scopes the lightbox to this block instance so
	// multiple galleries on a page don't merge into one gallery.
	const group = `bpgpb-${cId || ''}`;

	// Filter the imported media by the chosen Media Type (items without an
	// explicit type were imported before video support, so treat them as images).
	const visiblePhotos = selectedPhotos.filter((photo) => {
		if ('photo' === mediaType) {
			return 'video' !== photo.type;
		}
		if ('video' === mediaType) {
			return 'video' === photo.type;
		}
		return true;
	});

	// A photo's four-digit year (number) or null when it has no valid date.
	const photoYear = (photo) => {
		if (!photo.date) return null;
		const d = new Date(photo.date);
		return Number.isNaN(d.getTime()) ? null : d.getFullYear();
	};

	// Year chips (descending) built from the dates present in the gallery.
	const yearChips = showSearch && searchChips
		? [...new Set(visiblePhotos.map(photoYear).filter((y) => y !== null))].sort((a, b) => b - a)
		: [];

	// Apply the active year chip before the text search runs, so the two filters
	// compose (e.g. "beach" photos from 2024 only).
	const chipFilteredPhotos =
		showSearch && searchChips && activeYear
			? visiblePhotos.filter((photo) => photoYear(photo) === activeYear)
			: visiblePhotos;

	const searchedPhotos = (() => {
		if (!showSearch || !searchQuery.trim()) {
			return chipFilteredPhotos;
		}
		const query = searchQuery.toLowerCase().trim();
		// Strip commas so a selected date suggestion like "Oct 5, 2024" matches
		// the comma-free date tokens below.
		const queryWords = query.replace(/,/g, '').split(/\s+/);

		return chipFilteredPhotos.filter((photo) => {
			// Title match (substring).
			const titleMatch = photo.title && photo.title.toLowerCase().includes(query);

			// Alt text match (substring).
			const altMatch = photo.alt && photo.alt.toLowerCase().includes(query);

			// Date match — word-level so "Oct" and "October" match but "octob" does not.
			let dateMatch = false;
			if (photo.date) {
				const d = new Date(photo.date);
				if (!Number.isNaN(d.getTime())) {
					// Build a set of individual date-word tokens from multiple representations.
					const short = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
					const long = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
					const dateTokens = [...new Set(
						`${short} ${long}`.toLowerCase().replace(/[,]/g, '').split(/\s+/)
					)];
					// Every word the user typed must exactly equal a date token.
					dateMatch = queryWords.every((qw) => dateTokens.some((dt) => dt === qw));
				}
			}

			return titleMatch || dateMatch || altMatch;
		});
	})();

	// Frontend sort dropdown (Newest / Oldest / Random). 'default' keeps the
	// author's order. Random is reshuffled only when the order changes.
	const sortedPhotos = (() => {
		if (!showSort || 'default' === sortOrder) {
			return searchedPhotos;
		}
		const arr = [...searchedPhotos];
		if ('newest' === sortOrder) {
			arr.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
		} else if ('oldest' === sortOrder) {
			arr.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
		} else if ('random' === sortOrder) {
			// Reshuffle only when the photo set actually changes (its id list) — not
			// on every render — so unrelated setting changes don't reorder the grid.
			const sig = searchedPhotos.map((p) => p.id).join(',');
			if (randomOrderRef.current.sig !== sig) {
				const ids = searchedPhotos.map((p) => p.id);
				for (let i = ids.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[ids[i], ids[j]] = [ids[j], ids[i]];
				}
				randomOrderRef.current = { sig, order: ids };
			}
			const byId = new Map(searchedPhotos.map((p) => [p.id, p]));
			return randomOrderRef.current.order.map((id) => byId.get(id)).filter(Boolean);
		}
		return arr;
	})();

	const per = Math.max(1, parseInt(perPage, 10) || 9);
	const [visibleCount, setVisibleCount] = useState(per);
	const [page, setPage] = useState(1);

	// Reset paging whenever the set, search query, or the paging config changes.
	useEffect(() => {
		setVisibleCount(per);
		setPage(1);
	}, [per, paginationType, mediaType, selectedPhotos.length, searchQuery, activeYear]);

	// Abort any in-flight dictation if the gallery unmounts mid-listen.
	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort();
				} catch (e) {
					/* already gone */
				}
				recognitionRef.current = null;
			}
		};
	}, []);

	// Attach the Fancybox lightbox with a capture-phase click handler on the
	// wrapper, opening the lightbox imperatively from an explicit item list
	// (same approach as the lightbox-block plugin). This works identically in
	// the frontend and inside the editor iframe (where Fancybox's own click
	// delegation is unreliable), handles items added by Load More / page
	// changes without re-binding, and lets us render videos through Plyr —
	// Google Photos video URLs have no .mp4 extension, so Fancybox can't
	// auto-detect them as video.
	useEffect(() => {
		if (!wrapRef.current) {
			return undefined;
		}

		const root = wrapRef.current;

		// Plyr instances created for the currently open lightbox, so we can
		// pause on slide change and tear them down when the lightbox closes.
		const players = [];
		const destroyPlayers = () => {
			players.forEach((p) => {
				try {
					p.destroy();
				} catch (e) {
					/* already gone */
				}
			});
			players.length = 0;
		};

		// Escape a value before it is interpolated into a raw HTML attribute.
		// buildItem() feeds this markup to Fancybox as `type: 'html'`, so an
		// unescaped src/poster (both derived from author-controlled block
		// attributes) could break out of the attribute and inject markup —
		// stored XSS. Encoding &, ", <, > closes that off.
		const escAttr = (val) =>
			String(val ?? '')
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');

		// Markup for a video slide. Autoplay requires the video to be muted,
		// so force muted whenever autoplay is on.
		const videoHtml = (a) => {
			const src = escAttr(a.getAttribute('href'));
			const poster = escAttr(a.getAttribute('data-poster') || '');
			const muted = video.muted || video.autoplay ? ' muted' : '';
			const loop = video.loop ? ' loop' : '';
			const fit = false === video.fitToWindow ? '' : ' bpgpb-plyr-wrap--fit';
			return (
				`<div class="bpgpb-plyr-wrap${fit}"><video class="bpgpb-plyr" playsinline controls preload="metadata"${muted}${loop}` +
				`${poster ? ` poster="${poster}"` : ''}>` +
				`<source src="${src}" type="video/mp4" /></video></div>`
			);
		};

		const buildItem = (a) => {
			// Fancybox renders the caption via innerHTML, so escape it — the text
			// originates from author-controlled block attributes (photo title/date).
			const caption = false === lightbox.caption ? '' : escAttr(a.getAttribute('data-caption') || '');
			const href = a.getAttribute('href');
			// downloadSrc powers the toolbar download button (images are sideloaded
			// into the Media Library, so they're same-origin and download cleanly).
			if (a.classList.contains('is-video')) {
				return { type: 'html', html: videoHtml(a), caption, downloadSrc: href };
			}
			return { src: href, caption, downloadSrc: href };
		};

		const plyrOptions = {
			autoplay: !!video.autoplay,
			muted: !!video.muted || !!video.autoplay,
			loop: { active: !!video.loop },
			controls:
				false === video.controls
					? []
					: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
		};

		// Deep-link: reflect the open photo in the URL (?photo=N) so the link can
		// be shared and reopens that photo. No-op unless the option is on.
		const setPhotoParam = (n) => {
			if (!deepLink) return;
			try {
				const url = new URL(window.location.href);
				url.searchParams.set('photo', String(n));
				window.history.replaceState(null, '', url);
			} catch (e) {
				/* ignore */
			}
		};
		const clearPhotoParam = () => {
			if (!deepLink) return;
			try {
				const url = new URL(window.location.href);
				url.searchParams.delete('photo');
				window.history.replaceState(null, '', url);
			} catch (e) {
				/* ignore */
			}
		};

		// Current slide index (0-based), kept in sync so the share buttons can
		// target the exact open photo even when deep-link URL sync is off.
		let currentSlideIndex = 0;

		// Build the shareable URL for the current photo — always carries ?photo=N
		// so a shared/copied link reopens that photo.
		const shareUrl = () => {
			try {
				const url = new URL(window.location.href);
				url.searchParams.set('photo', String(currentSlideIndex + 1));
				return url.href;
			} catch (e) {
				return window.location.href;
			}
		};

		// Copy to clipboard with a fallback for non-secure contexts — the async
		// Clipboard API is unavailable on plain http:// sites (e.g. *.local).
		const execCopy = (text) => {
			try {
				const ta = document.createElement('textarea');
				ta.value = text;
				ta.setAttribute('readonly', '');
				ta.style.position = 'fixed';
				ta.style.top = '-9999px';
				document.body.appendChild(ta);
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			} catch (e) {
				/* ignore */
			}
		};
		const copyLink = (text) => {
			if (navigator.clipboard?.writeText) {
				navigator.clipboard.writeText(text).catch(() => execCopy(text));
			} else {
				execCopy(text);
			}
		};

		const options = {
			contentClick: 'toggleZoom',
			// Thumbnails bar along the bottom of the lightbox.
			Thumbs: false === lightbox.thumbs ? false : { showOnStart: true },
			// Slideshow autoplay (off by default; timeout in ms between slides).
			Slideshow: lightbox.slideshow
				? { playOnStart: true, timeout: lightbox.slideshowSpeed || 3000 }
				: { playOnStart: false },
			on: {
				// Enhance each video slide with Plyr once it's in the DOM, and keep
				// the deep-link URL in sync with the revealed slide.
				reveal: (fancybox, slide) => {
					const el = slide?.el?.querySelector?.('video.bpgpb-plyr');
					if (el) {
						players.push(new Plyr(el, plyrOptions));
					}
					currentSlideIndex = slide?.index ?? 0;
					setPhotoParam(currentSlideIndex + 1);
				},
				// Pause every player when the user navigates to another slide.
				'Carousel.change': () => {
					players.forEach((p) => {
						try {
							p.pause();
						} catch (e) {
							/* not ready */
						}
					});
				},
				destroy: () => {
					destroyPlayers();
					clearPhotoParam();
				},
			},
		};

		// Social share toolbar buttons (share the current page URL, which carries
		// the ?photo=N deep-link when that option is enabled).
		const shareIcon = (path) =>
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">${path}</svg>`;
		const shareItems = {
			bpgpbFb: {
				tpl: `<button class="f-button" title="Facebook">${shareIcon('<path d="M13 22v-8h2.7l.4-3H13V9c0-.9.2-1.5 1.5-1.5H16V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9V11H7.5v3H10v8h3z"/>')}</button>`,
				click: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`, '_blank', 'noopener,noreferrer'),
			},
			bpgpbX: {
				tpl: `<button class="f-button" title="X">${shareIcon('<path d="M17.5 3h2.9l-6.4 7.3L21.7 21h-5.9l-4.6-6-5.3 6H3l6.8-7.8L2.6 3h6l4.2 5.5L17.5 3zm-1 16h1.6L8.1 4.7H6.4L16.5 19z"/>')}</button>`,
				click: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl())}`, '_blank', 'noopener,noreferrer'),
			},
			bpgpbPin: {
				tpl: `<button class="f-button" title="Pinterest">${shareIcon('<path d="M12 2C6.5 2 3 5.6 3 9.9c0 2.6 1 4.9 3.2 5.8.3.1.6 0 .7-.4l.3-1c.1-.3 0-.5-.2-.7-.5-.6-.8-1.4-.8-2.5 0-3 2.3-5.7 5.9-5.7 3.2 0 5 2 5 4.6 0 3.5-1.5 6.4-3.8 6.4-1.3 0-2.2-1-1.9-2.3.3-1.5 1-3 1-4.1 0-.9-.5-1.7-1.6-1.7-1.3 0-2.3 1.3-2.3 3.1 0 1.1.4 1.9.4 1.9l-1.5 6.3c-.4 1.8-.1 4.1 0 4.3 0 .1.2.2.3.1.1-.1 1.7-2.1 2.2-4.1l.8-3.2c.4.8 1.6 1.5 2.9 1.5 3.8 0 6.4-3.5 6.4-8.1C21 5.2 17.3 2 12 2z"/>')}</button>`,
				click: () => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl())}`, '_blank', 'noopener,noreferrer'),
			},
			bpgpbCopy: {
				tpl: `<button class="f-button" title="Copy link">${shareIcon('<path d="M10.6 13.4a1 1 0 0 0 1.4 0l4-4a2.8 2.8 0 0 0-4-4l-1 1a1 1 0 0 0 1.4 1.4l1-1a.8.8 0 1 1 1.2 1.2l-4 4a1 1 0 0 0 0 1.4zM13.4 10.6a1 1 0 0 0-1.4 0l-4 4a2.8 2.8 0 0 0 4 4l1-1a1 1 0 1 0-1.4-1.4l-1 1a.8.8 0 0 1-1.2-1.2l4-4a1 1 0 0 0 0-1.4z"/>')}</button>`,
				click: () => copyLink(shareUrl()),
			},
		};

		// Build the toolbar only when share and/or download add buttons to it.
		if (lightboxShare || lightbox.download) {
			const right = [];
			if (lightboxShare) {
				right.push('bpgpbFb', 'bpgpbX', 'bpgpbPin', 'bpgpbCopy');
			}
			if (lightbox.download) {
				right.push('download');
			}
			right.push('slideshow', 'fullscreen', 'thumbs', 'close');
			options.Toolbar = {
				display: { left: ['infobar'], middle: [], right },
				items: lightboxShare ? shareItems : undefined,
			};
		}

		const onClick = (e) => {
			const anchor = e.target.closest(`[data-fancybox="${group}"]`);
			if (!anchor || !root.contains(anchor) || anchor.closest('.swiper-slide-duplicate')) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			// Build the slide list from every gallery anchor (skipping carousel
			// loop clones), then open the clicked one.
			const anchors = Array.from(root.querySelectorAll(`[data-fancybox="${group}"]`)).filter(
				(a) => !a.closest('.swiper-slide-duplicate')
			);

			const items = anchors.map(buildItem);
			const index = anchors.indexOf(anchor);

			// Overrides for Memories layout to look and behave like Google Photos Stories
			const activeOptions = { ...options };
			if (isMemories) {
				activeOptions.Slideshow = { playOnStart: true, timeout: 4000 };
				activeOptions.Thumbs = false; // Hide thumbnails for story view
				activeOptions.Toolbar = {
					display: {
						left: [],
						middle: [],
						right: ['slideshow', 'close']
					}
				};
			}

			Fancybox.show(items, { startIndex: index < 0 ? 0 : index, ...activeOptions });
		};

		root.addEventListener('click', onClick, true);
		return () => {
			root.removeEventListener('click', onClick, true);
			destroyPlayers();
		};
	}, [
		selectedPhotos,
		mediaType,
		isCarousel,
		isMemories,
		group,
		lightbox.caption,
		lightbox.thumbs,
		lightbox.download,
		lightbox.slideshow,
		lightbox.slideshowSpeed,
		video.autoplay,
		video.muted,
		video.loop,
		video.controls,
		video.fitToWindow,
		deepLink,
		lightboxShare,
	]);

	// Deep-link opener: if the URL carries ?photo=N, open that photo once the
	// gallery has rendered (reuses the click handler bound above). Active when
	// deep-linking OR social share is on, since shared links carry ?photo=N.
	useEffect(() => {
		if ((!deepLink && !lightboxShare) || isBackend || !wrapRef.current) {
			return undefined;
		}
		const p = parseInt(new URLSearchParams(window.location.search).get('photo'), 10);
		if (!p || p < 1) {
			return undefined;
		}
		const timer = setTimeout(() => {
			if (!wrapRef.current) return;
			const anchors = Array.from(wrapRef.current.querySelectorAll(`[data-fancybox="${group}"]`))
				.filter((a) => !a.closest('.swiper-slide-duplicate'));
			const target = anchors[p - 1];
			if (target) {
				target.click();
			}
		}, 400);
		return () => clearTimeout(timer);
	}, [deepLink, lightboxShare, group, isBackend]);

	if (!visiblePhotos.length) {
		// The user picked a specific Media Type but nothing in the gallery
		// matches it — show a friendly notice card instead of an empty block.
		if (selectedPhotos.length && 'all_media' !== mediaType) {
			const typeLabel =
				'video' === mediaType
					? __('videos', 'embed-google-photos')
					: __('photos', 'embed-google-photos');

			return (
				<div className="bpgpb-gallery-inner" id={`bpgpb-${cId}`}>
					<div className="bpgpb-empty-notice">
						<span className="bpgpb-empty-notice__icon" aria-hidden="true">
							{'video' === mediaType ? '🎬' : '🖼️'}
						</span>
						<p className="bpgpb-empty-notice__text">
							{
								/* translators: %s: media type (photos / videos) */
								sprintf(__('No %s found in this gallery.', 'embed-google-photos'), typeLabel)
							}
						</p>
						{isBackend && setAttributes && (
							<button
								type="button"
								className="bpgpb-empty-notice__reset"
								onClick={() => setAttributes({ mediaType: 'all_media' })}
							>
								{__('Show all media', 'embed-google-photos')}
							</button>
						)}
					</div>
				</div>
			);
		}

		return null;
	}

	// Convert a "16:9" style ratio into a CSS aspect-ratio value ("16 / 9").
	const ratio = (coverImage.ratio || '1:1').replace(':', ' / ');

	const wrapStyle = {
		'--bpgpb-cols': columns.desktop ?? 3,
		'--bpgpb-cols-tablet': columns.tablet ?? 2,
		'--bpgpb-cols-mobile': columns.mobile ?? 1,
		'--bpgpb-col-gap': columnGap || '30px',
		'--bpgpb-row-gap': rowGap || '40px',
		'--bpgpb-ratio': ratio,
		'--bpgpb-kb-speed': `${Math.max(2, parseInt(kenBurnsSpeed, 10) || 12)}s`,
	};

	// Tell the browser roughly how wide each image renders so it can pick the
	// right srcset candidate. Each image spans about (100% / column-count) of the
	// viewport at each breakpoint (matches the CSS grid + carousel breakpoints).
	const colsD = columns.desktop ?? 3;
	const colsT = columns.tablet ?? 2;
	const colsM = columns.mobile ?? 1;
	const sizesAttr =
		`(max-width: 576px) ${Math.round(100 / colsM)}vw, ` +
		`(max-width: 768px) ${Math.round(100 / colsT)}vw, ` +
		`${Math.round(100 / colsD)}vw`;

	// Caption text for a photo, based on the chosen source.
	const captionText = (photo) => {
		if ('date' === caption.source && photo.date) {
			const d = new Date(photo.date);
			return Number.isNaN(d.getTime())
				? ''
				: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
		}
		return photo.title || '';
	};

	// Wrap the part of `text` that matches the active search query in a <mark>
	// so visitors see why a result matched. Returns the plain string untouched
	// when search is off, the query is empty, or nothing matches.
	const highlight = (text) => {
		const q = searchQuery.trim();
		if (!showSearch || !searchHighlight || !q || !text) {
			return text;
		}
		const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const parts = String(text).split(new RegExp(`(${escaped})`, 'ig'));
		if (parts.length < 2) {
			return text;
		}
		const lowerQ = q.toLowerCase();
		return parts.map((part, i) =>
			part.toLowerCase() === lowerQ
				? <mark key={i} className="bpgpb-search-hl">{part}</mark>
				: part
		);
	};

	// Date + dimensions string for the optional hover meta overlay. Skip the date
	// when the caption is already showing it, so it never appears twice.
	const metaText = (photo) => {
		const parts = [];
		const captionShowsDate = caption.show && 'date' === caption.source;
		if (photo.date && !captionShowsDate) {
			const d = new Date(photo.date);
			if (!Number.isNaN(d.getTime())) {
				parts.push(d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
			}
		}
		if (photo.width && photo.height) {
			parts.push(`${photo.width} × ${photo.height}`);
		}
		return parts.join('  •  ');
	};

	// A single gallery item (used by every layout).
	const renderItem = (photo, index) => {
		const isVideo = photo.type === 'video';
		const media = photo.url || photo.thumb; // mp4 for video, image for photo
		const poster = photo.thumb || photo.url; // thumbnail / poster

		if (!media) {
			return null;
		}

		const text = caption.show ? captionText(photo) : '';
		const overlay = 'overlay' === caption.position;

		const meta = metaOverlay ? metaText(photo) : '';

		const itemClass = [
			'bpgpb-item',
			isVideo ? 'is-video' : '',
			text && !overlay ? 'has-caption-below' : '',
			hoverEffect && 'none' !== hoverEffect ? `bpgpb-hover--${hoverEffect}` : '',
			meta ? 'bpgpb-has-meta' : '',
		].filter(Boolean).join(' ');

		const inner = (
			<>
				<span className="bpgpb-item__media">
					<BlurImage
						src={poster}
						alt={photo.alt || text || ''}
						placeholder={photo.placeholder}
						srcSet={photo.srcset}
						sizes={sizesAttr}
						width={photo.width}
						height={photo.height}
						isBackend={isBackend}
						focalPoint={photo.focalPoint || globalFocalPoint}
					/>
					{isVideo && <span className="bpgpb-play">{playIcon}</span>}
					{meta && <span className="bpgpb-meta">{meta}</span>}
					{text && overlay && (
						<span className="bpgpb-caption bpgpb-caption--overlay">{highlight(text)}</span>
					)}
				</span>
				{text && !overlay && (
					<span className="bpgpb-caption bpgpb-caption--below">{highlight(text)}</span>
				)}
			</>
		);

		// Fancybox reads the trigger's data-caption for the lightbox caption.
		const lbCaption = false === lightbox.caption ? undefined : (captionText(photo) || undefined);

		return (
			<a
				className={itemClass}
				key={photo.id || index}
				href={media}
				data-fancybox={group}
				data-caption={lbCaption}
				data-poster={isVideo ? poster : undefined}
			>
				{inner}
			</a>
		);
	};

	const renderMemoryItem = (photo, index) => {
		const isVideo = photo.type === 'video';
		const media = photo.url || photo.thumb;
		const poster = photo.thumb || photo.url;

		if (!media) {
			return null;
		}

		const labelText = caption.show
			? (captionText(photo) || sprintf(__('Memory %d', 'embed-google-photos'), index + 1))
			: '';

		const lbCaption = false === lightbox.caption ? undefined : (captionText(photo) || undefined);

		const itemClass = [
			'bpgpb-memory-item',
			hoverEffect && 'none' !== hoverEffect ? `bpgpb-hover--${hoverEffect}` : '',
		].filter(Boolean).join(' ');

		return (
			<a
				className={itemClass}
				key={photo.id || index}
				href={media}
				data-fancybox={group}
				data-caption={lbCaption}
				data-poster={isVideo ? poster : undefined}
			>
				<div className="bpgpb-memory-circle">
					<div className="bpgpb-memory-circle-inner">
						<BlurImage
							src={poster}
							alt={photo.alt || labelText}
							placeholder={photo.placeholder}
							srcSet={photo.srcset}
							sizes="80px"
							width={photo.width}
							height={photo.height}
							isBackend={isBackend}
							focalPoint={photo.focalPoint || globalFocalPoint}
						/>
					</div>
					{isVideo && <span className="bpgpb-memory-play-badge">▶</span>}
				</div>
				{labelText && <span className="bpgpb-memory-label bpgpb-caption">{highlight(labelText)}</span>}
			</a>
		);
	};

	const renderSearchBar = () => {
		if (!showSearch) return null;
		const isExpandable = searchStyle === 'expandable';
		const isExpanded = !isExpandable || isSearchExpanded || searchQuery;

		// Autocomplete: unique photo titles AND formatted dates that contain what
		// the user typed (so "Oct" or "2024" suggests matching dates too). Capped
		// at 6, skips a value that exactly equals the query, empty when blank.
		const suggestions = (() => {
			if (!searchAutocomplete) return [];
			const q = searchQuery.toLowerCase().trim();
			if (!q) return [];
			const seen = new Set();
			const out = [];
			const addCandidate = (value) => {
				const text = (value || '').trim();
				if (!text) return;
				const key = text.toLowerCase();
				if (key === q || seen.has(key)) return;
				if (key.includes(q)) {
					seen.add(key);
					out.push(text);
				}
			};
			for (const photo of visiblePhotos) {
				addCandidate(photo.title);
				if (photo.date) {
					const d = new Date(photo.date);
					if (!Number.isNaN(d.getTime())) {
						addCandidate(d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
					}
				}
				if (out.length >= 6) break;
			}
			return out.slice(0, 6);
		})();

		const suggestionsOpen = showSuggestions && suggestions.length > 0;
		const suggestionsId = `bpgpb-search-list-${cId || ''}`;

		const selectSuggestion = (text) => {
			setSearchQuery(text);
			setShowSuggestions(false);
			setActiveSuggestion(-1);
			if (searchInputRef.current) {
				searchInputRef.current.focus();
			}
		};

		const onSearchKeyDown = (e) => {
			if (!suggestionsOpen) return;
			if ('ArrowDown' === e.key) {
				e.preventDefault();
				setActiveSuggestion((i) => (i + 1) % suggestions.length);
			} else if ('ArrowUp' === e.key) {
				e.preventDefault();
				setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
			} else if ('Enter' === e.key && activeSuggestion >= 0) {
				e.preventDefault();
				selectSuggestion(suggestions[activeSuggestion]);
			} else if ('Escape' === e.key) {
				setShowSuggestions(false);
				setActiveSuggestion(-1);
			}
		};

		return (
			<div className={`bpgpb-search-container bpgpb-search-align--${searchAlign} bpgpb-search-style--${searchStyle || 'classic'}`}>
				<div className={`bpgpb-search-input-wrap ${isExpanded ? 'is-expanded' : ''}`}>
					<span 
						className="bpgpb-search-icon"
						onMouseDown={(e) => {
							if (isExpandable) {
								e.preventDefault();
							}
						}}
						onClick={() => {
							if (isExpandable) {
								if (isSearchExpanded) {
									setIsSearchExpanded(false);
									setSearchQuery('');
								} else {
									setIsSearchExpanded(true);
									setTimeout(() => {
										if (searchInputRef.current) {
											searchInputRef.current.focus();
										}
									}, 100);
								}
							}
						}}
					>
						{searchIconRender}
					</span>
					<input
						ref={searchInputRef}
						type="text"
						className="bpgpb-search-input"
						placeholder={searchPlaceholder || __('Search photos...', 'embed-google-photos')}
						value={searchQuery}
						role="combobox"
						aria-expanded={suggestionsOpen}
						aria-controls={suggestionsId}
						aria-autocomplete="list"
						autoComplete="off"
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setShowSuggestions(true);
							setActiveSuggestion(-1);
						}}
						onFocus={() => setShowSuggestions(true)}
						onKeyDown={onSearchKeyDown}
						onBlur={() => {
							setShowSuggestions(false);
							setActiveSuggestion(-1);
							if (isExpandable && !searchQuery) {
								setIsSearchExpanded(false);
							}
						}}
					/>
					{searchQuery && (
						<button
							type="button"
							className="bpgpb-search-clear"
							onClick={() => {
								setSearchQuery('');
								if (isExpandable) {
									setIsSearchExpanded(false);
								}
							}}
							aria-label={__('Clear search', 'embed-google-photos')}
						>
							&times;
						</button>
					)}
					{voiceEnabled && isExpanded && (
						<button
							type="button"
							className={`bpgpb-search-mic ${isListening ? 'is-listening' : ''}`}
							onClick={toggleVoiceSearch}
							aria-label={isListening
								? __('Stop voice search', 'embed-google-photos')
								: __('Search by voice', 'embed-google-photos')}
							aria-pressed={isListening}
							title={__('Search by voice', 'embed-google-photos')}
						>
							{micIcon}
						</button>
					)}
					{suggestionsOpen && (
						<ul className="bpgpb-search-suggestions" role="listbox" id={suggestionsId}>
							{suggestions.map((text, i) => (
								<li
									key={text}
									role="option"
									aria-selected={i === activeSuggestion}
									className={`bpgpb-search-suggestion ${i === activeSuggestion ? 'is-active' : ''}`}
									// Keep focus on the input so onBlur doesn't close the
									// list before the click lands.
									onMouseDown={(e) => e.preventDefault()}
									onMouseEnter={() => setActiveSuggestion(i)}
									onClick={() => selectSuggestion(text)}
								>
									<span className="bpgpb-search-suggestion-icon" aria-hidden="true">{searchIconRender}</span>
									{highlight(text)}
								</li>
							))}
						</ul>
					)}
				</div>
				{yearChips.length > 1 && isExpanded && (
					<div className="bpgpb-search-chips" role="group" aria-label={__('Filter by year', 'embed-google-photos')}>
						<button
							type="button"
							className={`bpgpb-search-chip ${!activeYear ? 'is-active' : ''}`}
							aria-pressed={!activeYear}
							onClick={() => setActiveYear(null)}
						>
							{__('All', 'embed-google-photos')}
						</button>
						{yearChips.map((year) => (
							<button
								key={year}
								type="button"
								className={`bpgpb-search-chip ${activeYear === year ? 'is-active' : ''}`}
								aria-pressed={activeYear === year}
								onClick={() => setActiveYear(activeYear === year ? null : year)}
							>
								{year}
							</button>
						))}
					</div>
				)}
				{searchResultCount && (searchQuery.trim() || activeYear) && isExpanded && searchedPhotos.length > 0 && (
					<div className="bpgpb-search-count" aria-live="polite">
						{sprintf(
							/* translators: 1: number of matches, 2: total number of photos */
							__('%1$d of %2$d photos', 'embed-google-photos'),
							searchedPhotos.length,
							visiblePhotos.length
						)}
					</div>
				)}
			</div>
		);
	};

	// Count badge + sort dropdown shown above the gallery in every layout.
	const renderControls = () => {
		if (!showCountBadge && !showSort) {
			return null;
		}
		return (
			<div className="bpgpb-controls">
				{showCountBadge && (
					<span className="bpgpb-count-badge">
						{sprintf(
							/* translators: %d: number of photos */
							__('%d photos', 'embed-google-photos'),
							visiblePhotos.length
						)}
					</span>
				)}
				{showSort && (
					<select
						className="bpgpb-sort"
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value)}
						aria-label={__('Sort photos', 'embed-google-photos')}
					>
						<option value="default">{__('Default order', 'embed-google-photos')}</option>
						<option value="newest">{__('Newest first', 'embed-google-photos')}</option>
						<option value="oldest">{__('Oldest first', 'embed-google-photos')}</option>
						<option value="random">{__('Random', 'embed-google-photos')}</option>
					</select>
				)}
			</div>
		);
	};

	// ---- Carousel (Swiper) — same component in editor + frontend ----
	if (isCarousel) {
		const spaceBetween = parseInt(columnGap, 10) || 0;

		// Re-init cleanly when a structural setting changes.
		const swiperKey = [
			columns.desktop, columns.tablet, columns.mobile,
			carousel.loop, carousel.arrows, carousel.dots,
			carousel.autoplay, carousel.autoplaySpeed, spaceBetween,
			searchedPhotos.length,
		].join('-');

		const swiperSettings = {
			modules: [Navigation, Pagination, Autoplay],
			loop: !!carousel.loop,
			autoplay: carousel.autoplay
				? { delay: carousel.autoplaySpeed || 3000, disableOnInteraction: false }
				: false,
			breakpoints: {
				0: { slidesPerView: columns.mobile ?? 1, spaceBetween },
				577: { slidesPerView: columns.tablet ?? 2, spaceBetween },
				769: { slidesPerView: columns.desktop ?? 3, spaceBetween },
			},
			navigation: carousel.arrows ? { prevEl: prevRef.current, nextEl: nextRef.current } : false,
			// Let Swiper create + manage its own pagination element inside the
			// container (reliable in both the editor iframe and the frontend).
			pagination: carousel.dots ? { clickable: true } : false,
		};

		const hasResults = !showSearch || !searchQuery.trim() || searchedPhotos.length > 0;

		return (
			<div className="bpgpb-gallery-container" id={`bpgpb-${cId}`}>
				{renderSearchBar()}
				{renderControls()}
				{!hasResults ? (
					<div className="bpgpb-search-empty">
						<span className="bpgpb-search-empty-icon">{searchIconRender}</span>
						<p className="bpgpb-search-empty-text">{__('No matching photos found.', 'embed-google-photos')}</p>
					</div>
				) : (
					<div className={`bpgpb-gallery-inner bpgpb-gallery-inner--carousel${kenBurns ? ' bpgpb-kenburns' : ''}`} style={wrapStyle} ref={wrapRef}>
						{carousel.arrows && (
							<>
								<button type="button" ref={prevRef} className="bpgpb-swiper-arrow bpgpb-swiper-arrow--prev" aria-label="Previous">‹</button>
								<button type="button" ref={nextRef} className="bpgpb-swiper-arrow bpgpb-swiper-arrow--next" aria-label="Next">›</button>
							</>
						)}

						<Swiper
							key={swiperKey}
							{...swiperSettings}
							onBeforeInit={(swiper) => {
								if (carousel.arrows) {
									swiper.params.navigation.prevEl = prevRef.current;
									swiper.params.navigation.nextEl = nextRef.current;
								}
							}}
						>
							{sortedPhotos.map((photo, index) => (
								<SwiperSlide key={photo.id || index}>{renderItem(photo, index)}</SwiperSlide>
							))}
						</Swiper>
					</div>
				)}
			</div>
		);
	}

	if (isMemories) {
		const spaceBetween = 15;
		const swiperKey = [
			carousel.loop, carousel.arrows, carousel.dots,
			carousel.autoplay, carousel.autoplaySpeed, spaceBetween,
			searchedPhotos.length,
		].join('-');

		const swiperSettings = {
			modules: [Navigation, Pagination, Autoplay],
			slidesPerView: 'auto',
			spaceBetween,
			loop: !!carousel.loop,
			autoplay: carousel.autoplay
				? { delay: carousel.autoplaySpeed || 3000, disableOnInteraction: false }
				: false,
			navigation: carousel.arrows ? { prevEl: prevRef.current, nextEl: nextRef.current } : false,
			pagination: carousel.dots ? { clickable: true } : false,
			grabCursor: true,
		};

		const hasResults = !showSearch || !searchQuery.trim() || searchedPhotos.length > 0;

		return (
			<div className="bpgpb-gallery-container" id={`bpgpb-${cId}`}>
				{renderSearchBar()}
				{renderControls()}
				{!hasResults ? (
					<div className="bpgpb-search-empty">
						<span className="bpgpb-search-empty-icon">{searchIconRender}</span>
						<p className="bpgpb-search-empty-text">{__('No matching photos found.', 'embed-google-photos')}</p>
					</div>
				) : (
					<div className="bpgpb-gallery-inner bpgpb-gallery-inner--memories" style={wrapStyle} ref={wrapRef}>
						{carousel.arrows && (
							<>
								<button type="button" ref={prevRef} className="bpgpb-swiper-arrow bpgpb-swiper-arrow--prev" aria-label="Previous">‹</button>
								<button type="button" ref={nextRef} className="bpgpb-swiper-arrow bpgpb-swiper-arrow--next" aria-label="Next">›</button>
							</>
						)}
						<Swiper
							key={swiperKey}
							{...swiperSettings}
							className="bpgpb-memories-swiper"
							onBeforeInit={(swiper) => {
								if (carousel.arrows) {
									swiper.params.navigation.prevEl = prevRef.current;
									swiper.params.navigation.nextEl = nextRef.current;
								}
							}}
						>
							{sortedPhotos.map((photo, index) => (
								<SwiperSlide key={photo.id || index} style={{ width: '90px' }}>
									{renderMemoryItem(photo, index)}
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				)}
			</div>
		);
	}

	// ---- Grid / Masonry (with Load More / Pagination) ----
	// A "preview limit" caps the grid to the first N photos with a "View all"
	// button; until the visitor expands it, Load More / Pagination are hidden.
	const limit = Math.max(0, parseInt(previewLimit, 10) || 0);
	const previewActive = limit > 0 && !showAll;

	let pagePhotos = sortedPhotos;
	let showLoadMore = false;
	let totalPages = 1;
	let activePage = 1;
	let showViewAll = false;

	if (previewActive) {
		pagePhotos = sortedPhotos.slice(0, limit);
		showViewAll = sortedPhotos.length > limit;
	} else if ('load_more' === paginationType) {
		pagePhotos = sortedPhotos.slice(0, visibleCount);
		showLoadMore = visibleCount < sortedPhotos.length;
	} else if ('pagination' === paginationType) {
		totalPages = Math.ceil(sortedPhotos.length / per);
		activePage = Math.min(page, totalPages);
		const start = (activePage - 1) * per;
		pagePhotos = sortedPhotos.slice(start, start + per);
	}

	const hasResults = !showSearch || !searchQuery.trim() || searchedPhotos.length > 0;

	// Numbered pagination: change the page
	const goToPage = (nextPage) => {
		if (nextPage === activePage) {
			return;
		}
		setPage(nextPage);
	};

	return (
		<div className="bpgpb-gallery-container" id={`bpgpb-${cId}`}>
			{renderSearchBar()}
			{renderControls()}
			{!hasResults ? (
				<div className="bpgpb-search-empty">
					<span className="bpgpb-search-empty-icon">{searchIconRender}</span>
					<p className="bpgpb-search-empty-text">{__('No matching photos found.', 'embed-google-photos')}</p>
				</div>
			) : (
				<div className={`bpgpb-gallery-inner${kenBurns ? ' bpgpb-kenburns' : ''}`} style={wrapStyle} ref={wrapRef}>
					<div className={`bpgpb-grid bpgpb-grid--${layout}`}>
						{pagePhotos.map(renderItem)}
					</div>

					{showViewAll && (
						<div className="bpgpb-load-more-wrap">
							<button
								type="button"
								className="bpgpb-load-more"
								onClick={() => setShowAll(true)}
							>
								{sprintf(
									/* translators: %d: total number of photos */
									__('View all %d photos', 'embed-google-photos'),
									sortedPhotos.length
								)}
							</button>
						</div>
					)}

					{!previewActive && 'load_more' === paginationType && showLoadMore && (
						<div className="bpgpb-load-more-wrap">
							<button
								type="button"
								className="bpgpb-load-more"
								onClick={() => setVisibleCount((count) => count + per)}
							>
								{loadMoreText || 'Load More'}
							</button>
						</div>
					)}

					{!previewActive && 'pagination' === paginationType && totalPages > 1 && (
						<div className="bpgpb-pagination">
							{Array.from({ length: totalPages }, (unused, i) => (
								<button
									type="button"
									key={i}
									className={`bpgpb-page${activePage === i + 1 ? ' is-active' : ''}`}
									onClick={() => goToPage(i + 1)}
								>
									{i + 1}
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Gallery;
