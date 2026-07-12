import { __ } from '@wordpress/i18n';
import { PanelBody, __experimentalBoxControl as BoxControl, } from '@wordpress/components';
import { produce } from 'immer';
import { Typography, ColorsControl } from '../../../../../bpl-tools/Components';
import { BorderControl } from '../../../../../bpl-tools/Components/Deprecated';

import { emUnit, pxUnit } from '../../../../../bpl-tools/utils/options';

const Style = ({ setAttributes, imgBorder, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding }) => {
    return <>
        <PanelBody className='bPlPanelBody' title={__('Image', 'embed-google-photos')} initialOpen={false}>
            <BorderControl className='' label={__('Border', 'embed-google-photos')} value={imgBorder}
                onChange={(val) => setAttributes({ imgBorder: val })} />
        </PanelBody>

        <PanelBody className='bPlPanelBody' title={__('Load More Button', 'embed-google-photos')} initialOpen={false}>
            <Typography className='mt10' label={__('Typography', 'embed-google-photos')} value={loadMoreBtnTypo} onChange={val => setAttributes({ loadMoreBtnTypo: val })} produce={produce} />

            <ColorsControl className='mt10 mb10' label={__('Colors', 'tiktok')} value={loadMoreBtnColors} onChange={val => setAttributes({ loadMoreBtnColors: val })} defaults={{ color: '#fff', bg: '#ff3b5c' }} />

            <BoxControl label={__('Padding', 'tiktok')} values={loadMoreBtnPadding} onChange={val => setAttributes({ loadMoreBtnPadding: val })} units={[pxUnit(3), emUnit(2)]} resetValues={{ top: 0, right: 0, bottom: 0, left: 0 }} />

            <BorderControl className='' label={__('Border', 'embed-google-photos')} value={loadMoreBtnBorder}
                onChange={(val) => setAttributes({ loadMoreBtnBorder: val })} />
        </PanelBody>
    </>
}
export default Style;