import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
 * @param {boolean} props.isBackend  true in the editor (no lightbox), false on the frontend.
 */
const Gallery = ({ attributes, cId, isBackend = false }) => {
	const {
		selectedPhotos = [],
		columns = {},
		columnGap,
		rowGap,
		coverImage = {},
		mediaType = 'all_media',
		layout = 'grid',
		hoverEffect = 'none',
		carousel = {},
		caption = {},
		lightbox = {},
		paginationType = 'load_more',
		perPage = 9,
		loadMoreText = 'Load More',
	} = attributes;
	const wrapRef = useRef();
	const prevRef = useRef();
	const nextRef = useRef();
	const isCarousel = 'carousel' === layout;

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

	const per = Math.max(1, parseInt(perPage, 10) || 9);
	const [visibleCount, setVisibleCount] = useState(per);
	const [page, setPage] = useState(1);

	// Reset paging whenever the set or the paging config changes.
	useEffect(() => {
		setVisibleCount(per);
		setPage(1);
	}, [per, paginationType, mediaType, selectedPhotos.length]);

	// Frontend only: attach the Fancybox lightbox (delegated on the wrapper, so
	// items added by Load More / page changes work without re-binding). Carousel
	// loop clones slides — exclude those so the lightbox has no duplicates.
	useEffect(() => {
		if (isBackend || typeof Fancybox === 'undefined' || !wrapRef.current) {
			return undefined;
		}

		const selector = isCarousel
			? '.swiper-slide:not(.swiper-slide-duplicate) [data-fancybox]'
			: '[data-fancybox]';

		Fancybox.bind(wrapRef.current, selector, {
			contentClick: 'toggleZoom',
			// Thumbnails bar along the bottom of the lightbox.
			Thumbs: false === lightbox.thumbs ? false : { showOnStart: true },
			// Slideshow autoplay (off by default; timeout in ms between slides).
			Slideshow: lightbox.slideshow
				? { autoStart: true, timeout: lightbox.slideshowSpeed || 3000 }
				: { autoStart: false },
		});

		return () => {
			if (typeof Fancybox !== 'undefined' && wrapRef.current) {
				Fancybox.unbind(wrapRef.current);
			}
		};
	}, [selectedPhotos, mediaType, isCarousel, isBackend, lightbox.thumbs, lightbox.slideshow, lightbox.slideshowSpeed]);

	if (!visiblePhotos.length) {
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
	};

	const group = `bpgpb-${cId || ''}`;

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

		const itemClass = [
			'bpgpb-item',
			isVideo ? 'is-video' : '',
			text && !overlay ? 'has-caption-below' : '',
			hoverEffect && 'none' !== hoverEffect ? `bpgpb-hover--${hoverEffect}` : '',
		].filter(Boolean).join(' ');

		const inner = (
			<>
				<span className="bpgpb-item__media">
					<img src={poster} alt={photo.alt || text || ''} loading="lazy" />
					{isVideo && <span className="bpgpb-play">{playIcon}</span>}
					{text && overlay && (
						<span className="bpgpb-caption bpgpb-caption--overlay">{text}</span>
					)}
				</span>
				{text && !overlay && (
					<span className="bpgpb-caption bpgpb-caption--below">{text}</span>
				)}
			</>
		);

		if (isBackend) {
			return (
				<div className={itemClass} key={photo.id || index}>
					{inner}
				</div>
			);
		}

		// Fancybox reads the trigger's data-caption for the lightbox caption.
		const lbCaption = false === lightbox.caption ? undefined : (captionText(photo) || undefined);

		return (
			<a className={itemClass} key={photo.id || index} href={media} data-fancybox={group} data-caption={lbCaption}>
				{inner}
			</a>
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
			visiblePhotos.length,
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

		return (
			<div className="bpgpb-gallery-inner bpgpb-gallery-inner--carousel" id={`bpgpb-${cId}`} style={wrapStyle} ref={wrapRef}>
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
					{visiblePhotos.map((photo, index) => (
						<SwiperSlide key={photo.id || index}>{renderItem(photo, index)}</SwiperSlide>
					))}
				</Swiper>
			</div>
		);
	}

	// ---- Grid / Masonry (with Load More / Pagination) ----
	let pagePhotos = visiblePhotos;
	let showLoadMore = false;
	let totalPages = 1;
	let activePage = 1;

	if ('load_more' === paginationType) {
		pagePhotos = visiblePhotos.slice(0, visibleCount);
		showLoadMore = visibleCount < visiblePhotos.length;
	} else if ('pagination' === paginationType) {
		totalPages = Math.ceil(visiblePhotos.length / per);
		activePage = Math.min(page, totalPages);
		const start = (activePage - 1) * per;
		pagePhotos = visiblePhotos.slice(start, start + per);
	}

	return (
		<div className="bpgpb-gallery-inner" id={`bpgpb-${cId}`} style={wrapStyle} ref={wrapRef}>
			<div className={`bpgpb-grid bpgpb-grid--${layout}`}>
				{pagePhotos.map(renderItem)}
			</div>

			{'load_more' === paginationType && showLoadMore && (
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

			{'pagination' === paginationType && totalPages > 1 && (
				<div className="bpgpb-pagination">
					{Array.from({ length: totalPages }, (unused, i) => (
						<button
							type="button"
							key={i}
							className={`bpgpb-page${activePage === i + 1 ? ' is-active' : ''}`}
							onClick={() => setPage(i + 1)}
						>
							{i + 1}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default Gallery;
