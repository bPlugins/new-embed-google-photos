import { getBoxValue } from '../../bpl-tools/utils/functions';
import { getBorderCSS, getTypoCSS } from '../../bpl-tools/utils/getCSS';

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
		hover = {},
		captionTypo,
		captionColor,
		loadMoreBtnTypo,
		loadMoreBtnColors = {},
		loadMoreBtnBorder,
		loadMoreBtnPadding,
	} = attributes;

	const sl = `#bpgpb-${cId}`;
	const btnColor = loadMoreBtnColors.color || '#fff';
	const btnBg = loadMoreBtnColors.bg || '#2f5aae';
	const typo = getTypoCSS(`${sl} .bpgpb-load-more`, loadMoreBtnTypo) || {};
	const capTypo = getTypoCSS(`${sl} .bpgpb-caption`, captionTypo) || {};

	// Hover-effect tuning (all scoped per instance).
	const zoomScale = 1 + (Number(hover.zoom ?? 8) / 100);
	const overlayColor = hover.overlayColor || 'rgba(0,0,0,0.4)';
	const dur = Number(hover.duration ?? 450);

	return (
		<style
			dangerouslySetInnerHTML={{
				__html: `
					${typo.googleFontLink || ''}
					${typo.styles || ''}
					${capTypo.googleFontLink || ''}
					${capTypo.styles || ''}

					${sl} .bpgpb-item.bpgpb-hover--zoom .bpgpb-item__media img {
						transition: transform ${dur}ms ease;
					}
					${sl} .bpgpb-item.bpgpb-hover--zoom:hover .bpgpb-item__media img {
						transform: scale(${zoomScale});
					}
					${sl} .bpgpb-item.bpgpb-hover--overlay .bpgpb-item__media::after {
						background: ${overlayColor};
						transition: opacity ${dur}ms ease;
					}
					${sl} .bpgpb-caption--overlay {
						transition: opacity ${dur}ms ease, transform ${dur}ms ease;
					}

					${captionColor ? `${sl} .bpgpb-caption { color: ${captionColor}; }` : ''}

					${sl} .bpgpb-item {
						${getBorderCSS(imgBorder)}
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
				`.replace(/\s+/g, ' '),
			}}
		/>
	);
};
export default Style;
