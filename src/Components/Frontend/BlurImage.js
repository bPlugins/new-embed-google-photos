import { useEffect, useRef, useState } from 'react';

/**
 * Lazy-loaded image with a blurred low-res "blur-up" placeholder.
 *
 * The tiny placeholder (WordPress thumbnail size) shows instantly and the
 * full-size image fades in once it finishes loading. The real `src` is only
 * set when the item scrolls within 300px of the viewport, so the browser never
 * downloads off-screen images — a strict, visible lazy-load (native
 * loading="lazy" preloads a large distance ahead, so we drive it explicitly
 * with IntersectionObserver).
 *
 * @param {Object} props
 * @param {string} props.src           Full-size image URL (fallback).
 * @param {string} props.alt           Alt text.
 * @param {string} [props.placeholder] Tiny image URL shown blurred while loading.
 * @param {string} [props.srcSet]      Responsive candidate set (WordPress srcset).
 * @param {string} [props.sizes]       Sizes hint describing the displayed width.
 * @param {number} [props.width]       Intrinsic width (reserves space / avoids layout shift).
 * @param {number} [props.height]      Intrinsic height (reserves space / avoids layout shift).
 * @param {boolean} [props.isBackend]  True in the block editor — load immediately (see below).
 * @param {Object}  [props.focalPoint] {x,y} (0–1) crop focus; maps to object-position.
 */
const BlurImage = ({ src, alt, placeholder, srcSet, sizes, width, height, isBackend = false, focalPoint }) => {
	const [loaded, setLoaded] = useState(false);
	// In the block editor the canvas is an iframe, and an IntersectionObserver
	// created in the main frame never reports the iframe's elements as
	// intersecting — so the src would never be set and imported photos would
	// show up blank. Skip lazy-loading there and load the image immediately.
	const [inView, setInView] = useState(isBackend);
	const imgRef = useRef(null);

	// Map a {x,y} focal point (0–1) to a CSS object-position so cropping layouts
	// keep the chosen subject in frame. Undefined leaves the CSS default (center).
	const objectPosition = focalPoint
		? `${Math.round((focalPoint.x ?? 0.5) * 100)}% ${Math.round((focalPoint.y ?? 0.5) * 100)}%`
		: undefined;

	useEffect(() => {
		if (isBackend) {
			return undefined;
		}
		const el = imgRef.current;
		if (!el) {
			return undefined;
		}
		if (!('IntersectionObserver' in window)) {
			setInView(true); // Old browsers: just load everything.
			return undefined;
		}

		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setInView(true);
					io.disconnect();
				}
			},
			{ rootMargin: '300px 0px' }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<>
			{inView && placeholder && !loaded && (
				<img
					className="bpgpb-item__lqip"
					src={placeholder}
					alt=""
					aria-hidden="true"
					style={objectPosition ? { objectPosition } : undefined}
				/>
			)}
			<img
				ref={imgRef}
				className={`bpgpb-item__img${loaded ? ' is-loaded' : ''}`}
				src={inView ? src : undefined}
				srcSet={inView && srcSet ? srcSet : undefined}
				sizes={inView && srcSet ? sizes : undefined}
				alt={alt}
				width={width || undefined}
				height={height || undefined}
				loading="lazy"
				onLoad={() => setLoaded(true)}
				style={objectPosition ? { objectPosition } : undefined}
			/>
		</>
	);
};

export default BlurImage;
