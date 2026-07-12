import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { PanelBody, PanelRow, SelectControl, RangeControl, __experimentalUnitControl as UnitControl, TextControl, ToggleControl } from '@wordpress/components';

import { Label } from '../../../../../bpl-tools/Components';
import { BDevice } from '../../../../../bpl-tools/Components/Deprecated';
import { emUnit, perUnit, pxUnit } from '../../../../../bpl-tools/utils/options';
import { favoriteOpt, layoutShowOpt, mediaTypeOpt, photosOpt, ratioOpt } from '../../../utils/options';

const General = ({ setAttributes, photosType, favorite, albumId, mediaType, columns, columnGap, rowGap, coverImage, layoutShow, album, categoriesOpt }) => {

    const [device, setDevice] = useState('desktop');
    const { title, isTitle } = album;
    return <>
        <PanelBody className='bPlPanelBody' title={__('Google Photos Type', 'embed-google-photos')} initialOpen={true}>
            <SelectControl label={__('Select Type', 'embed-google-photos')} labelPosition="side" value={photosType} options={[{ label: 'Select', value: '' }, ...photosOpt]} onChange={(val) => setAttributes({ photosType: val })} />

            {photosType === "albums" && <>

                {
                    layoutShow === "albums" && <> <ToggleControl className='mt10' label={__('Title Show/Hide', 'embed-google-photos')} checked={isTitle} onChange={(val) => setAttributes({ album: { ...album, isTitle: val } })} />

                        {isTitle && <TextControl className='mt10' label={__('Title', 'embed-google-photos')} value={title} onChange={(val) => setAttributes({ album: { ...album, title: val } })} />}
                    </>
                }

                <SelectControl className='mt10' label={__('Album List', 'embed-google-photos')} labelPosition="side" value={layoutShow} options={layoutShowOpt} onChange={val => setAttributes({ layoutShow: val })} />

                {layoutShow !== "albums" && <SelectControl className='mt10' label={__('Select Album', 'embed-google-photos')} labelPosition="side" value={albumId} options={[{ label: 'Select', value: '' }, ...categoriesOpt]} onChange={val => setAttributes({ albumId: val })} />}
            </>}

            {photosType === 'photos' && <SelectControl className='mt10' label={__('Feature', 'embed-google-photos')} labelPosition='side' value={favorite} options={favoriteOpt} onChange={val => setAttributes({ favorite: val })} />}

            {photosType !== 'albums' && <SelectControl label={__('Media Type', 'embed-google-photos')} labelPosition='side' value={mediaType} options={mediaTypeOpt} onChange={val => setAttributes({ mediaType: val })} />}
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Image Aspect Ratio', 'embed-google-photos')} initialOpen={false}>
            <SelectControl className="mt15" label={__('Ratio', 'embed-google-photos')} labelPosition="side" value={coverImage?.ratio} options={ratioOpt} onChange={(val) => {
                setAttributes({ coverImage: { ...coverImage, ratio: val } })
            }} />
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Layout', 'embed-google-photos')} initialOpen={false}>
            <PanelRow>
                <Label mt='0'>{__('Columns:', 'embed-google-photos')}</Label>
                <BDevice device={device} onChange={val => setDevice(val)} />
            </PanelRow>

            <RangeControl value={columns[device]} onChange={val => { setAttributes({ columns: { ...columns, [device]: val } }) }} min={1} max={6} step={1} beforeIcon='grid-view' />

            <UnitControl className='mt20' label={__('Column Gap:', 'embed-google-photos')} labelPosition='left' value={columnGap} onChange={val => setAttributes({ columnGap: val })} units={[pxUnit(30), perUnit(3), emUnit(2)]} isResetValueOnUnitChange={true} />

            <UnitControl className='mt20' label={__('Row Gap:', 'embed-google-photos')} labelPosition='left' value={rowGap} onChange={val => setAttributes({ rowGap: val })} units={[pxUnit(40), perUnit(3), emUnit(2.5)]} isResetValueOnUnitChange={true} />
        </PanelBody>
    </>
}
export default General;