import { getBoxValue } from '../../../../bpl-tools/utils/functions';
import { getBorderCSS, getTypoCSS } from '../../../../bpl-tools/utils/getCSS';

/**
 * Per-instance CSS for the gallery, rendered in BOTH the editor and the
 * frontend so every Style-tab setting matches in both places.
 *
 * Scoped to the gallery's own id (#bpgpb-<cId>) so it never depends on the
 * outer block wrapper, which differs between the editor and the frontend.
 *
 * @param {Object} props.attributes Block attributes.
 * @param {string} props.cId        Stable client id shared with the Gallery.
 */
const Style = ({ attributes, cId }) => {
	const {
		imgBorder,
		imageFilter = 'none',
		imageFilterHover = false,
		hover = {},
		captionTypo,
		captionColor,
		loadMoreBtnTypo,
		loadMoreBtnColors = {},
		loadMoreBtnBorder,
		loadMoreBtnPadding,
		showSearch,
		searchBgColor,
		searchTextColor,
		searchBorderColor,
		searchBorderRadius,
		searchBorderWidth,
		searchTypo,
		searchAlign,
		searchWidth,
		searchIconColor,
		searchIconSize,
		searchHeight,
	} = attributes;

	const sl = `#bpgpb-${cId}`;
	const btnColor = loadMoreBtnColors.color || '#fff';
	const btnBg = loadMoreBtnColors.bg || '#2f5aae';

	// Security: everything below is injected into a raw <style> via
	// dangerouslySetInnerHTML. Block attributes are author-controlled, so a
	// value like `red}</style><img src=x onerror=alert(1)>` would break out of
	// the style element and execute script for every visitor (stored XSS).
	// `<` and `>` are never valid anywhere inside CSS, so stripping them from
	// the final string makes it impossible to close the <style> tag or open any
	// element, neutralising the injection while leaving legitimate styling intact.
	const hardenCSS = (css) => css.replace(/\s+/g, ' ').replace(/[<>]/g, '');
	const typo = getTypoCSS(`${sl} .bpgpb-load-more`, loadMoreBtnTypo) || {};
	const capTypo = getTypoCSS(`${sl} .bpgpb-caption`, captionTypo) || {};
	const searchTypoCSS = getTypoCSS(`${sl} .bpgpb-search-input`, searchTypo) || {};

	// Hover-effect tuning (all scoped per instance).
	const zoomScale = 1 + (Number(hover.zoom ?? 8) / 100);
	const overlayColor = hover.overlayColor || 'rgba(0,0,0,0.4)';
	const dur = Number(hover.duration ?? 450);

	const alignJustify = searchAlign === 'left' ? 'flex-start' : (searchAlign === 'right' ? 'flex-end' : 'center');

	// Visual filter presets. Each maps to a raw CSS `filter` value applied to the
	// gallery images; `imageFilterHover` reveals the original (unfiltered) image
	// on hover with a smooth transition.
	const FILTER_MAP = {
		grayscale: 'grayscale(100%)',
		sepia: 'sepia(80%)',
		vintage: 'sepia(45%) contrast(1.08) brightness(1.05) saturate(1.25)',
		warm: 'saturate(1.35) sepia(20%) contrast(1.05)',
		cool: 'saturate(1.1) hue-rotate(15deg) brightness(1.03)',
	};
	const filterValue = FILTER_MAP[imageFilter] || '';

	return (
		<style
			dangerouslySetInnerHTML={{
				__html: hardenCSS(`
					${typo.googleFontLink || ''}
					${typo.styles || ''}
					${capTypo.googleFontLink || ''}
					${capTypo.styles || ''}
					${searchTypoCSS.googleFontLink || ''}
					${searchTypoCSS.styles || ''}

					${sl} .bpgpb-item.bpgpb-hover--zoom .bpgpb-item__media img {
						transition: transform ${dur}ms ease, filter ${dur}ms ease;
					}
					${sl} .bpgpb-item.bpgpb-hover--zoom:hover .bpgpb-item__media img {
						transform: scale(${zoomScale});
					}
					${sl} .bpgpb-memory-item.bpgpb-hover--zoom:hover .bpgpb-memory-circle {
						transform: scale(${zoomScale});
					}
					${sl} .bpgpb-item.bpgpb-hover--overlay .bpgpb-item__media::after {
						background: ${overlayColor};
						transition: opacity ${dur}ms ease;
					}
					${sl} .bpgpb-caption--overlay {
						transition: opacity ${dur}ms ease, transform ${dur}ms ease;
					}

					${filterValue ? `
						${sl} .bpgpb-item__media img,
						${sl} .bpgpb-memory-circle-inner img {
							filter: ${filterValue};
							transition: filter ${dur}ms ease;
						}
						${imageFilterHover ? `
							${sl} .bpgpb-item:hover .bpgpb-item__media img,
							${sl} .bpgpb-memory-item:hover .bpgpb-memory-circle-inner img {
								filter: none;
							}
						` : ''}
					` : ''}

					${captionColor ? `${sl} .bpgpb-caption { color: ${captionColor}; }` : ''}

					${sl} .bpgpb-item {
						${getBorderCSS(imgBorder)}
					}

					${sl} .bpgpb-memory-circle {
						${getBorderCSS(imgBorder)}
						border-radius: 50% !important;
						transition: transform ${dur}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color ${dur}ms ease, box-shadow ${dur}ms ease;
					}

					${sl} .bpgpb-load-more {
						color: ${btnColor};
						background: ${btnBg};
						${getBorderCSS(loadMoreBtnBorder)}
						padding: ${getBoxValue(loadMoreBtnPadding)};
					}

					${sl} .bpgpb-page.is-active {
						color: ${btnColor};
						background: ${btnBg};
						border-color: ${btnBg};
					}

					${showSearch ? `
						${sl} .bpgpb-search-container {
							display: flex;
							flex-direction: column;
							align-items: ${alignJustify};
						}
						${sl} .bpgpb-search-input-wrap {
							--bpgpb-search-bg: ${searchBgColor || '#f1f3f4'};
							--bpgpb-search-border: ${searchBorderWidth || '1px'} solid ${searchBorderColor || '#e0e0e0'};
							--bpgpb-search-radius: ${searchBorderRadius || '8px'};
							--bpgpb-search-height: ${searchHeight || '40px'};
							width: 100%;
							max-width: ${searchWidth || '300px'};
						}
						${sl} .bpgpb-search-input {
							background-color: ${searchBgColor || '#f1f3f4'};
							color: ${searchTextColor || '#3c4043'};
							border: ${searchBorderWidth || '1px'} solid ${searchBorderColor || '#e0e0e0'};
							border-radius: ${searchBorderRadius || '8px'};
							height: ${searchHeight || '40px'};
						}
						${sl} .bpgpb-search-input::placeholder {
							color: ${searchTextColor || '#3c4043'};
							opacity: 0.6;
						}
						${sl} .bpgpb-search-icon {
							color: ${searchIconColor || searchTextColor || '#5f6368'};
							font-size: ${searchIconSize || 18}px;
						}
						${sl} .bpgpb-search-icon svg {
							width: ${searchIconSize || 18}px;
							height: ${searchIconSize || 18}px;
						}
						${sl} .bpgpb-search-clear {
							color: ${searchTextColor || '#5f6368'};
						}
					` : ''}
				`),
			}}
		/>
	);
};
export default Style;
