import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Notice, PanelBody, PanelRow, SelectControl, RangeControl, TextControl, ToggleControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';

import { Label, Notice as ProNotice } from '../../../../../../bpl-tools/Components';
import { BDevice } from '../../../../../../bpl-tools/Components/Deprecated';
import { emUnit, perUnit, pxUnit } from '../../../../../../bpl-tools/utils/options';
import { captionPositionOpt, captionSourceOpt, layoutOpt, mediaTypeOpt, paginationOpt, ratioOpt } from '../../../../utils/options';
import IconPicker from './IconPicker';

const General = ({ setAttributes, mediaType, layout, carousel = {}, caption = {}, lightbox = {}, video = {}, paginationType, perPage, loadMoreText, columns, columnGap, rowGap, coverImage, showSearch, searchPlaceholder, searchAlign, searchWidth, searchIcon, searchStyle, showVoiceSearch, searchAutocomplete, searchHighlight, searchResultCount, searchChips }) => {

    const [device, setDevice] = useState('desktop');
    const setCarousel = (key, val) => setAttributes({ carousel: { ...carousel, [key]: val } });
    const setCaption = (key, val) => setAttributes({ caption: { ...caption, [key]: val } });
    const setLightbox = (key, val) => setAttributes({ lightbox: { ...lightbox, [key]: val } });
    const setVideo = (key, val) => setAttributes({ video: { ...video, [key]: val } });

    // Contextual footer note for the Search Features group: hovering/focusing a
    // toggle shows its explanation below the group, so notes stay available
    // without a help paragraph under every row.
    const [featureHint, setFeatureHint] = useState('');
    const featureRow = (label, note, checked, onChange) => (
        <div
            className='bpgpb-feature-row'
            onMouseEnter={() => setFeatureHint(note)}
            onMouseLeave={() => setFeatureHint('')}
            onFocusCapture={() => setFeatureHint(note)}
            onBlurCapture={() => setFeatureHint('')}
        >
            <ToggleControl label={label} checked={checked} onChange={onChange} __nextHasNoMarginBottom />
        </div>
    );
    return <>
        <PanelBody className='bPlPanelBody' title={__('Media Type', 'embed-google-photos')} initialOpen={true}>
            <SelectControl label={__('Media Type', 'embed-google-photos')} labelPosition='side' value={mediaType} options={mediaTypeOpt} onChange={val => setAttributes({ mediaType: val })} />

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Pro features: Add More Photos (unlimited galleries), Album Auto-Sync, WebP conversion, and Watermark stamping.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Caption', 'embed-google-photos')} initialOpen={false}>
            <ToggleControl label={__('Show Caption', 'embed-google-photos')} checked={!!caption.show} onChange={val => setCaption('show', val)} />

            {caption.show && <>
                <SelectControl className='mt10' label={__('Source', 'embed-google-photos')} labelPosition='side' value={caption.source || 'title'} options={captionSourceOpt} onChange={val => setCaption('source', val)} />

                {layout !== 'memories' && <SelectControl className='mt10' label={__('Position', 'embed-google-photos')} labelPosition='side' value={caption.position || 'overlay'} options={captionPositionOpt} onChange={val => setCaption('position', val)} />}
            </>}
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Search Bar', 'embed-google-photos')} initialOpen={false}>
            <ToggleControl label={__('Enable Search Bar', 'embed-google-photos')} checked={!!showSearch} onChange={val => setAttributes({ showSearch: val })} />

            {showSearch && <>
                <TextControl className='mt10' label={__('Placeholder Text', 'embed-google-photos')} value={searchPlaceholder} placeholder={__('Search photos...', 'embed-google-photos')} onChange={val => setAttributes({ searchPlaceholder: val })} />

                <SelectControl className='mt10' label={__('Search Style', 'embed-google-photos')} labelPosition='side' value={searchStyle || 'classic'} options={[
                    { label: __('Classic (Always Visible)', 'embed-google-photos'), value: 'classic' },
                    { label: __('Expandable (Slide-out)', 'embed-google-photos'), value: 'expandable' }
                ]} onChange={val => setAttributes({ searchStyle: val })} />

                <div className='bpgpb-search-features'>
                    <p className='bpgpb-search-features__title'>{__('Search Features', 'embed-google-photos')}</p>
                    {featureRow(__('Voice Search', 'embed-google-photos'), __('Let visitors search by speaking. Uses the browser\'s built-in speech recognition; hidden automatically where unsupported.', 'embed-google-photos'), false !== showVoiceSearch, val => setAttributes({ showVoiceSearch: val }))}
                    {featureRow(__('Autocomplete', 'embed-google-photos'), __('Show matching photo titles and dates in a dropdown as visitors type.', 'embed-google-photos'), !!searchAutocomplete, val => setAttributes({ searchAutocomplete: val }))}
                    {(caption.show || searchAutocomplete) && featureRow(__('Highlight Matches', 'embed-google-photos'), __('Highlight the matched text in captions and suggestions.', 'embed-google-photos'), !!searchHighlight, val => setAttributes({ searchHighlight: val }))}
                    {featureRow(__('Result Count', 'embed-google-photos'), __('Show a live "3 of 125 photos" count while filtering.', 'embed-google-photos'), !!searchResultCount, val => setAttributes({ searchResultCount: val }))}
                    {featureRow(__('Year Filter Chips', 'embed-google-photos'), __('Show one-click year chips to filter the gallery by date.', 'embed-google-photos'), !!searchChips, val => setAttributes({ searchChips: val }))}
                    <p className='bpgpb-search-features__hint'>
                        <span className='bpgpb-search-features__hint-icon' aria-hidden='true'>&#9432;</span>
                        {featureHint || __('Hover an option to see what it does.', 'embed-google-photos')}
                    </p>
                </div>

                <SelectControl className='mt10' label={__('Alignment', 'embed-google-photos')} labelPosition='side' value={searchAlign} options={[
                    { label: __('Left', 'embed-google-photos'), value: 'left' },
                    { label: __('Center', 'embed-google-photos'), value: 'center' },
                    { label: __('Right', 'embed-google-photos'), value: 'right' }
                ]} onChange={val => setAttributes({ searchAlign: val })} />

                <UnitControl className='mt20' label={__('Search Bar Width:', 'embed-google-photos')} labelPosition='left' value={searchWidth} onChange={val => setAttributes({ searchWidth: val })} units={[pxUnit(300), perUnit(50), emUnit(20)]} isResetValueOnUnitChange={true} />

                <IconPicker label={__('Search Icon', 'embed-google-photos')} value={searchIcon} onChange={val => setAttributes({ searchIcon: val })} />
            </>}
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Lightbox', 'embed-google-photos')} initialOpen={false}>
            <Notice status='info' isDismissible={false} className='mb10'>
                {__('To see how the lightbox actually looks, view it on the frontend.', 'embed-google-photos')}
            </Notice>

            <ToggleControl label={__('Show Caption', 'embed-google-photos')} checked={false !== lightbox.caption} onChange={val => setLightbox('caption', val)} />

            <ToggleControl className='mt10' label={__('Thumbnails Bar', 'embed-google-photos')} checked={false !== lightbox.thumbs} onChange={val => setLightbox('thumbs', val)} />

            <ToggleControl className='mt10' label={__('Download Button', 'embed-google-photos')} help={__('Add a download button to the lightbox toolbar so visitors can save the original image.', 'embed-google-photos')} checked={!!lightbox.download} onChange={val => setLightbox('download', val)} />

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

        {layout !== 'memories' && <PanelBody className='bPlPanelBody' title={__('Pagination', 'embed-google-photos')} initialOpen={false}>
            <SelectControl label={__('Type', 'embed-google-photos')} labelPosition='side' value={paginationType} options={paginationOpt} onChange={val => setAttributes({ paginationType: val })} />

            {paginationType !== 'none' && <RangeControl className='mt10' label={__('Items Per Page', 'embed-google-photos')} value={perPage} onChange={val => setAttributes({ perPage: val })} min={1} max={60} step={1} />}

            {paginationType === 'load_more' && <TextControl className='mt10' label={__('Button Text', 'embed-google-photos')} value={loadMoreText} onChange={val => setAttributes({ loadMoreText: val })} />}
        </PanelBody>}

        {('carousel' !== layout && 'memories' !== layout) && <PanelBody className='bPlPanelBody' title={__('Frontend Filter', 'embed-google-photos')} initialOpen={false}>
            <ProNotice status='premium' isIcon={true}>
                {__('Let visitors filter the gallery by Photos / Videos on the frontend (isotope-style) with the Pro version.', 'embed-google-photos')}
            </ProNotice>
        </PanelBody>}

        {('masonry' !== layout && 'memories' !== layout) && <PanelBody className='bPlPanelBody' title={__('Image Aspect Ratio', 'embed-google-photos')} initialOpen={false}>
            <SelectControl className="mt15" label={__('Ratio', 'embed-google-photos')} labelPosition="side" value={coverImage?.ratio} options={ratioOpt} onChange={(val) => {
                setAttributes({ coverImage: { ...coverImage, ratio: val } })
            }} />
        </PanelBody>}

        <PanelBody className='bPlPanelBody' title={__('Layout', 'embed-google-photos')} initialOpen={false}>
            <SelectControl label={__('Layout', 'embed-google-photos')} labelPosition='side' value={layout} options={layoutOpt} onChange={val => setAttributes({ layout: val })} />

            <ProNotice status='premium' isIcon={true} className='mt10'>
                {__('Justified and Mosaic layouts are available in the Premium version.', 'embed-google-photos')}
            </ProNotice>

            {layout !== 'memories' && <>
                <PanelRow className='mt15'>
                    <Label mt='0'>{__('Columns:', 'embed-google-photos')}</Label>
                    <BDevice device={device} onChange={val => setDevice(val)} />
                </PanelRow>

                <RangeControl value={columns[device]} onChange={val => { setAttributes({ columns: { ...columns, [device]: val } }) }} min={1} max={6} step={1} beforeIcon='grid-view' />

                <UnitControl className='mt20' label={__('Column Gap:', 'embed-google-photos')} labelPosition='left' value={columnGap} onChange={val => setAttributes({ columnGap: val })} units={[pxUnit(30), perUnit(3), emUnit(2)]} isResetValueOnUnitChange={true} />

                <UnitControl className='mt20' label={__('Row Gap:', 'embed-google-photos')} labelPosition='left' value={rowGap} onChange={val => setAttributes({ rowGap: val })} units={[pxUnit(40), perUnit(3), emUnit(2.5)]} isResetValueOnUnitChange={true} />
            </>}
        </PanelBody>

        {('carousel' === layout || 'memories' === layout) && <PanelBody className='bPlPanelBody' title={__('Carousel Settings', 'embed-google-photos')} initialOpen={true}>
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