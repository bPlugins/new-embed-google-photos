import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Notice, PanelBody, PanelRow, SelectControl, RangeControl, TextControl, ToggleControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';

import { Label, Notice as ProNotice } from '../../../../../../bpl-tools/Components';
import { BDevice } from '../../../../../../bpl-tools/Components/Deprecated';
import { emUnit, perUnit, pxUnit } from '../../../../../../bpl-tools/utils/options';
import { captionPositionOpt, captionSourceOpt, layoutOpt, mediaTypeOpt, paginationOpt, ratioOpt } from '../../../../utils/options';

const General = ({ setAttributes, mediaType, layout, carousel = {}, caption = {}, lightbox = {}, video = {}, paginationType, perPage, loadMoreText, columns, columnGap, rowGap, coverImage }) => {

    const [device, setDevice] = useState('desktop');
    const setCarousel = (key, val) => setAttributes({ carousel: { ...carousel, [key]: val } });
    const setCaption = (key, val) => setAttributes({ caption: { ...caption, [key]: val } });
    const setLightbox = (key, val) => setAttributes({ lightbox: { ...lightbox, [key]: val } });
    const setVideo = (key, val) => setAttributes({ video: { ...video, [key]: val } });
    return <>
        <PanelBody className='bPlPanelBody' title={__('Media Type', 'embed-google-photos')} initialOpen={true}>
            <SelectControl label={__('Media Type', 'embed-google-photos')} labelPosition='side' value={mediaType} options={mediaTypeOpt} onChange={val => setAttributes({ mediaType: val })} />

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Add More Photos — keep adding to a gallery over multiple picks to build large, unlimited galleries — is available in the Pro version.', 'embed-google-photos')}
            </ProNotice>

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Album Auto-Sync — link a shared Google Photos album and new photos appear automatically — is available in the Pro version.', 'embed-google-photos')}
            </ProNotice>

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Convert imported images to WebP (smaller, faster-loading) with the Pro version.', 'embed-google-photos')}
            </ProNotice>

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Stamp your logo as a watermark on imported photos with the Pro version.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Caption', 'embed-google-photos')} initialOpen={false}>
            <ToggleControl label={__('Show Caption', 'embed-google-photos')} checked={!!caption.show} onChange={val => setCaption('show', val)} />

            {caption.show && <>
                <SelectControl className='mt10' label={__('Source', 'embed-google-photos')} labelPosition='side' value={caption.source || 'title'} options={captionSourceOpt} onChange={val => setCaption('source', val)} />

                <SelectControl className='mt10' label={__('Position', 'embed-google-photos')} labelPosition='side' value={caption.position || 'overlay'} options={captionPositionOpt} onChange={val => setCaption('position', val)} />
            </>}
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Lightbox', 'embed-google-photos')} initialOpen={false}>
            <Notice status='info' isDismissible={false} className='mb10'>
                {__('To see how the lightbox actually looks, view it on the frontend.', 'embed-google-photos')}
            </Notice>

            <ToggleControl label={__('Show Caption', 'embed-google-photos')} checked={false !== lightbox.caption} onChange={val => setLightbox('caption', val)} />

            <ToggleControl className='mt10' label={__('Thumbnails Bar', 'embed-google-photos')} checked={false !== lightbox.thumbs} onChange={val => setLightbox('thumbs', val)} />

            <ToggleControl className='mt10' label={__('Slideshow Autoplay', 'embed-google-photos')} checked={!!lightbox.slideshow} onChange={val => setLightbox('slideshow', val)} />

            {lightbox.slideshow && <RangeControl className='mt10' label={__('Slideshow Speed (ms)', 'embed-google-photos')} value={lightbox.slideshowSpeed || 3000} onChange={val => setLightbox('slideshowSpeed', val)} min={1000} max={10000} step={500} />}

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Premium lightbox skins (Dark, Light, Glass, Minimal) are available in the Pro version.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Video', 'embed-google-photos')} initialOpen={false}>
            <ToggleControl label={__('Show Controls', 'embed-google-photos')} checked={false !== video.controls} onChange={val => setVideo('controls', val)} />

            <ToggleControl className='mt10' label={__('Autoplay', 'embed-google-photos')} help={__('Videos are muted automatically when autoplay is on (required by browsers).', 'embed-google-photos')} checked={!!video.autoplay} onChange={val => setVideo('autoplay', val)} />

            <ToggleControl className='mt10' label={__('Muted', 'embed-google-photos')} checked={!!video.muted} onChange={val => setVideo('muted', val)} />

            <ToggleControl className='mt10' label={__('Loop', 'embed-google-photos')} checked={!!video.loop} onChange={val => setVideo('loop', val)} />

            <ToggleControl className='mt10' label={__('Fit To Window Height', 'embed-google-photos')} help={__('Fit the video player to the window height (keeping aspect ratio). Turn off to use the default width-based height.', 'embed-google-photos')} checked={false !== video.fitToWindow} onChange={val => setVideo('fitToWindow', val)} />

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Autoplay videos right in the gallery grid as live previews with the Pro version.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Pagination', 'embed-google-photos')} initialOpen={false}>
            <SelectControl label={__('Type', 'embed-google-photos')} labelPosition='side' value={paginationType} options={paginationOpt} onChange={val => setAttributes({ paginationType: val })} />

            {paginationType !== 'none' && <RangeControl className='mt10' label={__('Items Per Page', 'embed-google-photos')} value={perPage} onChange={val => setAttributes({ perPage: val })} min={1} max={60} step={1} />}

            {paginationType === 'load_more' && <TextControl className='mt10' label={__('Button Text', 'embed-google-photos')} value={loadMoreText} onChange={val => setAttributes({ loadMoreText: val })} />}
        </PanelBody>

        {'carousel' !== layout && <PanelBody className='bPlPanelBody' title={__('Frontend Filter', 'embed-google-photos')} initialOpen={false}>
            <ProNotice status='premium' isIcon={true}>
                {__('Let visitors filter the gallery by Photos / Videos on the frontend (isotope-style) with the Pro version.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>}

        {'masonry' !== layout && <PanelBody className='bPlPanelBody' title={__('Image Aspect Ratio', 'embed-google-photos')} initialOpen={false}>
            <SelectControl className="mt15" label={__('Ratio', 'embed-google-photos')} labelPosition="side" value={coverImage?.ratio} options={ratioOpt} onChange={(val) => {
                setAttributes({ coverImage: { ...coverImage, ratio: val } })
            }} />
        </PanelBody>}

        <PanelBody className='bPlPanelBody' title={__('Layout', 'embed-google-photos')} initialOpen={false}>
            <SelectControl label={__('Layout', 'embed-google-photos')} labelPosition='side' value={layout} options={layoutOpt} onChange={val => setAttributes({ layout: val })} />

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Justified and Mosaic layouts are available in the Premium version.', 'embed-google-photos')}
            </ProNotice>

            <PanelRow className='mt15'>
                <Label mt='0'>{__('Columns:', 'embed-google-photos')}</Label>
                <BDevice device={device} onChange={val => setDevice(val)} />
            </PanelRow>

            <RangeControl value={columns[device]} onChange={val => { setAttributes({ columns: { ...columns, [device]: val } }) }} min={1} max={6} step={1} beforeIcon='grid-view' />

            <UnitControl className='mt20' label={__('Column Gap:', 'embed-google-photos')} labelPosition='left' value={columnGap} onChange={val => setAttributes({ columnGap: val })} units={[pxUnit(30), perUnit(3), emUnit(2)]} isResetValueOnUnitChange={true} />

            <UnitControl className='mt20' label={__('Row Gap:', 'embed-google-photos')} labelPosition='left' value={rowGap} onChange={val => setAttributes({ rowGap: val })} units={[pxUnit(40), perUnit(3), emUnit(2.5)]} isResetValueOnUnitChange={true} />
        </PanelBody>

        {'carousel' === layout && <PanelBody className='bPlPanelBody' title={__('Carousel Settings', 'embed-google-photos')} initialOpen={true}>
            <ToggleControl label={__('Autoplay', 'embed-google-photos')} checked={!!carousel.autoplay} onChange={val => setCarousel('autoplay', val)} />

            {carousel.autoplay && <RangeControl className='mt10' label={__('Autoplay Speed (ms)', 'embed-google-photos')} value={carousel.autoplaySpeed || 3000} onChange={val => setCarousel('autoplaySpeed', val)} min={1000} max={10000} step={500} />}

            <ToggleControl className='mt10' label={__('Loop', 'embed-google-photos')} checked={!!carousel.loop} onChange={val => setCarousel('loop', val)} />

            <ToggleControl className='mt10' label={__('Navigation Arrows', 'embed-google-photos')} checked={!!carousel.arrows} onChange={val => setCarousel('arrows', val)} />

            <ToggleControl className='mt10' label={__('Pagination Dots', 'embed-google-photos')} checked={!!carousel.dots} onChange={val => setCarousel('dots', val)} />

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Advanced carousel options (effects, transition speed, centered slides, free mode…) are available in the Pro version.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>}
    </>
}
export default General;