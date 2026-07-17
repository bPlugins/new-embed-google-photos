import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl, RangeControl, ToggleControl, __experimentalBoxControl as BoxControl, } from '@wordpress/components';
import { produce } from 'immer';
import { Typography, ColorsControl, ColorControl, Notice as ProNotice } from '../../../../../../bpl-tools/Components';
import { BorderControl } from '../../../../../../bpl-tools/Components/Deprecated';

import { emUnit, pxUnit } from '../../../../../../bpl-tools/utils/options';
import { hoverEffectOpt, imageFilterOpt } from '../../../../utils/options';

const Style = ({ setAttributes, layout, paginationType, imgBorder, hoverEffect, imageFilter = 'none', imageFilterHover = false, hover = {}, caption = {}, captionTypo, captionColor, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding, showSearch, searchBgColor, searchTextColor, searchBorderColor, searchBorderRadius, searchBorderWidth, searchTypo, searchIconColor, searchIconSize, searchHeight }) => {
    const btnPanelTitle = 'pagination' === paginationType
        ? __('Pagination', 'embed-google-photos')
        : __('Load More Button', 'embed-google-photos');

    const setHover = (key, val) => setAttributes({ hover: { ...hover, [key]: val } });
    const effect = hoverEffect || 'none';

    return <>
        <PanelBody className='bPlPanelBody' title={__('Image', 'embed-google-photos')} initialOpen={false}>
            <BorderControl className='' label={__('Border', 'embed-google-photos')} value={imgBorder}
                onChange={(val) => setAttributes({ imgBorder: val })} />

            <SelectControl className='mt10' label={__('Hover Effect', 'embed-google-photos')} labelPosition='side' value={effect} options={hoverEffectOpt} onChange={(val) => setAttributes({ hoverEffect: val })} />

            <SelectControl className='mt10' label={__('Photo Filter', 'embed-google-photos')} labelPosition='side' value={imageFilter || 'none'} options={imageFilterOpt} onChange={(val) => setAttributes({ imageFilter: val })} />

            {'none' !== imageFilter && <ToggleControl className='mt10' label={__('Reveal original on hover', 'embed-google-photos')} help={__('Show the unfiltered image when a visitor hovers over it, with a smooth transition.', 'embed-google-photos')} checked={!!imageFilterHover} onChange={(val) => setAttributes({ imageFilterHover: val })} />}

            {'zoom' === effect && <RangeControl className='mt10' label={__('Zoom Amount (%)', 'embed-google-photos')} value={hover.zoom ?? 8} onChange={val => setHover('zoom', val)} min={0} max={50} step={1} />}

            {'overlay' === effect && <ColorControl className='mt10' label={__('Overlay Color', 'embed-google-photos')} value={hover.overlayColor || 'rgba(0,0,0,0.4)'} defaultColor='rgba(0,0,0,0.4)' onChange={val => setHover('overlayColor', val)} />}

            {'none' !== effect && <RangeControl className='mt10' label={__('Animation Speed (ms)', 'embed-google-photos')} value={hover.duration ?? 450} onChange={val => setHover('duration', val)} min={0} max={2000} step={50} />}

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Pro unlocks advanced image styling — box shadow, advanced (per-corner) radius, gradient overlays, hover icon — plus per-image custom links, right-click / download protection and password-protected galleries.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>

        {caption.show && <PanelBody className='bPlPanelBody' title={__('Caption', 'embed-google-photos')} initialOpen={false}>
            <Typography className='mt10' label={__('Typography', 'embed-google-photos')} value={captionTypo} onChange={val => setAttributes({ captionTypo: val })} produce={produce} />

            <ColorControl className='mt10' label={__('Color', 'embed-google-photos')} value={captionColor} onChange={val => setAttributes({ captionColor: val })} />
        </PanelBody>}

        {showSearch && <PanelBody className='bPlPanelBody' title={__('Search Bar', 'embed-google-photos')} initialOpen={false}>
            <Typography className='mt10' label={__('Typography', 'embed-google-photos')} value={searchTypo} onChange={val => setAttributes({ searchTypo: val })} produce={produce} />

            <ColorControl className='mt10' label={__('Text Color', 'embed-google-photos')} value={searchTextColor} onChange={val => setAttributes({ searchTextColor: val })} />

            <ColorControl className='mt10' label={__('Background Color', 'embed-google-photos')} value={searchBgColor} onChange={val => setAttributes({ searchBgColor: val })} />

            <ColorControl className='mt10' label={__('Border Color', 'embed-google-photos')} value={searchBorderColor} onChange={val => setAttributes({ searchBorderColor: val })} />

            <ColorControl className='mt10' label={__('Icon Color', 'embed-google-photos')} value={searchIconColor} onChange={val => setAttributes({ searchIconColor: val })} />

            <RangeControl className='mt10' label={__('Icon Size (px)', 'embed-google-photos')} value={searchIconSize || 18} onChange={val => setAttributes({ searchIconSize: val })} min={12} max={30} step={1} />

            <RangeControl className='mt10' label={__('Search Bar Height (px)', 'embed-google-photos')} value={parseInt(searchHeight, 10) || 40} onChange={val => setAttributes({ searchHeight: `${val}px` })} min={30} max={60} step={1} />

            <RangeControl className='mt10' label={__('Border Width (px)', 'embed-google-photos')} value={parseInt(searchBorderWidth, 10) || 1} onChange={val => setAttributes({ searchBorderWidth: `${val}px` })} min={0} max={10} step={1} />

            <RangeControl className='mt10' label={__('Border Radius (px)', 'embed-google-photos')} value={parseInt(searchBorderRadius, 10) || 8} onChange={val => setAttributes({ searchBorderRadius: `${val}px` })} min={0} max={50} step={1} />
        </PanelBody>}

        {'none' !== paginationType && 'memories' !== layout && <PanelBody className='bPlPanelBody' title={btnPanelTitle} initialOpen={false}>
            <Typography className='mt10' label={__('Typography', 'embed-google-photos')} value={loadMoreBtnTypo} onChange={val => setAttributes({ loadMoreBtnTypo: val })} produce={produce} />

            <ColorsControl className='mt10 mb10' label={__('Colors', 'tiktok')} value={loadMoreBtnColors} onChange={val => setAttributes({ loadMoreBtnColors: val })} defaults={{ color: '#fff', bg: '#ff3b5c' }} />

            <BoxControl label={__('Padding', 'tiktok')} values={loadMoreBtnPadding} onChange={val => setAttributes({ loadMoreBtnPadding: val })} units={[pxUnit(3), emUnit(2)]} resetValues={{ top: 0, right: 0, bottom: 0, left: 0 }} />

            <BorderControl className='' label={__('Border', 'embed-google-photos')} value={loadMoreBtnBorder}
                onChange={(val) => setAttributes({ loadMoreBtnBorder: val })} />
        </PanelBody>}
    </>
}
export default Style;
