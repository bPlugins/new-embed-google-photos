import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow, TabPanel, SelectControl, RangeControl, __experimentalUnitControl as UnitControl, __experimentalBoxControl as BoxControl, TextControl, ToggleControl } from '@wordpress/components';

import { produce } from 'immer';

// Settings Components
import { ColorsControl, Label, Typography } from '../../../../../bpl-tools/Components';
import { BDevice, BorderControl } from '../../../../../bpl-tools/Components/Deprecated';

import { tabController } from '../../../../../bpl-tools/utils/functions';
import { emUnit, perUnit, pxUnit } from '../../../../../bpl-tools/utils/options';
import { favoriteOpt, generalStyleTabs, layoutShowOpt, mediaTypeOpt, photosOpt, ratioOpt } from '../../../utils/options';
import General from './General/General';
import Style from './Style/Style';
import AltText from './AltText';
import ReorderPhotos from './ReorderPhotos';


const Settings = ({ attributes, setAttributes }) => {
	const { selectedPhotos, photosType, favorite, albumId, mediaType, layout, carousel, caption, lightbox, video, paginationType, perPage, loadMoreText, columns, columnGap, rowGap, coverImage, imgBorder, hoverEffect, hover, captionTypo, captionColor, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding, layoutShow, album } = attributes;
	const [device, setDevice] = useState('desktop');
	const { title, isTitle } = album;

	const generalProps = { setAttributes, photosType, favorite, albumId, mediaType, layout, carousel, caption, lightbox, video, paginationType, perPage, loadMoreText, columns, columnGap, rowGap, coverImage, layoutShow, album };

	const styleProps = { setAttributes, paginationType, imgBorder, hoverEffect, hover, captionTypo, captionColor, caption, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding };

	return <>
		<InspectorControls>
			<TabPanel className='bPlTabPanel' activeClass='activeTab' tabs={generalStyleTabs} onSelect={tabController}>{tab => <>
				{'general' === tab.name && <>
					<General {...generalProps} />
					<ReorderPhotos selectedPhotos={selectedPhotos} setAttributes={setAttributes} />
					<AltText selectedPhotos={selectedPhotos} setAttributes={setAttributes} />
				</>}

				{'style' === tab.name && <>
					<Style {...styleProps} />
				</>}
			</>}</TabPanel>
		</InspectorControls>
	</>;
};
export default Settings;