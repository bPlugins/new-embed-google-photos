import { __ } from '@wordpress/i18n';
import { PanelBody, SelectControl, RangeControl, __experimentalBoxControl as BoxControl, } from '@wordpress/components';
import { produce } from 'immer';
import { Typography, ColorsControl, ColorControl } from '../../../../../bpl-tools/Components';
import { BorderControl } from '../../../../../bpl-tools/Components/Deprecated';

import { emUnit, pxUnit } from '../../../../../bpl-tools/utils/options';
import { hoverEffectOpt } from '../../../utils/options';

const Style = ({ setAttributes, paginationType, imgBorder, hoverEffect, hover = {}, caption = {}, captionTypo, captionColor, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding }) => {
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

            {'zoom' === effect && <RangeControl className='mt10' label={__('Zoom Amount (%)', 'embed-google-photos')} value={hover.zoom ?? 8} onChange={val => setHover('zoom', val)} min={0} max={50} step={1} />}

            {'overlay' === effect && <ColorControl className='mt10' label={__('Overlay Color', 'embed-google-photos')} value={hover.overlayColor || 'rgba(0,0,0,0.4)'} defaultColor='rgba(0,0,0,0.4)' onChange={val => setHover('overlayColor', val)} />}

            {'none' !== effect && <RangeControl className='mt10' label={__('Animation Speed (ms)', 'embed-google-photos')} value={hover.duration ?? 450} onChange={val => setHover('duration', val)} min={0} max={2000} step={50} />}
        </PanelBody>

        {caption.show && <PanelBody className='bPlPanelBody' title={__('Caption', 'embed-google-photos')} initialOpen={false}>
            <Typography className='mt10' label={__('Typography', 'embed-google-photos')} value={captionTypo} onChange={val => setAttributes({ captionTypo: val })} produce={produce} />

            <ColorControl className='mt10' label={__('Color', 'embed-google-photos')} value={captionColor} onChange={val => setAttributes({ captionColor: val })} />
        </PanelBody>}

        {'none' !== paginationType && <PanelBody className='bPlPanelBody' title={btnPanelTitle} initialOpen={false}>
            <Typography className='mt10' label={__('Typography', 'embed-google-photos')} value={loadMoreBtnTypo} onChange={val => setAttributes({ loadMoreBtnTypo: val })} produce={produce} />

            <ColorsControl className='mt10 mb10' label={__('Colors', 'tiktok')} value={loadMoreBtnColors} onChange={val => setAttributes({ loadMoreBtnColors: val })} defaults={{ color: '#fff', bg: '#ff3b5c' }} />

            <BoxControl label={__('Padding', 'tiktok')} values={loadMoreBtnPadding} onChange={val => setAttributes({ loadMoreBtnPadding: val })} units={[pxUnit(3), emUnit(2)]} resetValues={{ top: 0, right: 0, bottom: 0, left: 0 }} />

            <BorderControl className='' label={__('Border', 'embed-google-photos')} value={loadMoreBtnBorder}
                onChange={(val) => setAttributes({ loadMoreBtnBorder: val })} />
        </PanelBody>}
    </>
}
export default Style;
