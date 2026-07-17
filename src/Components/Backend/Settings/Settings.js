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
import FocalPoint from './FocalPoint';
import ReorderPhotos from './ReorderPhotos';
import ImportExport from './ImportExport';


const Settings = ({ attributes, setAttributes }) => {
	const { selectedPhotos, photosType, favorite, albumId, mediaType, layout, carousel, caption, lightbox, video, paginationType, perPage, loadMoreText, columns, columnGap, rowGap, coverImage, focalPoint, imgBorder, hoverEffect, imageFilter, imageFilterHover, kenBurns, kenBurnsSpeed, metaOverlay, showSort, previewLimit, showCountBadge, deepLink, lightboxShare, sortColors, sortBorderColor, sortTypo, countColors, countTypo, hover, captionTypo, captionColor, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding, layoutShow, album, showSearch, searchIcon, searchPlaceholder, searchAlign, searchWidth, searchBgColor, searchTextColor, searchBorderColor, searchBorderRadius, searchBorderWidth, searchTypo, searchIconColor, searchIconSize, searchStyle, searchHeight, showVoiceSearch, searchAutocomplete, searchHighlight, searchResultCount, searchChips } = attributes;
	const [device, setDevice] = useState('desktop');
	const { title, isTitle } = album;

	const generalProps = { setAttributes, photosType, favorite, albumId, mediaType, layout, carousel, caption, lightbox, video, paginationType, perPage, loadMoreText, columns, columnGap, rowGap, coverImage, layoutShow, album, showSearch, searchIcon, searchPlaceholder, searchAlign, searchWidth, searchStyle, showVoiceSearch, searchAutocomplete, searchHighlight, searchResultCount, searchChips, showSort, previewLimit, showCountBadge, deepLink, lightboxShare };

	const styleProps = { setAttributes, layout, paginationType, imgBorder, hoverEffect, imageFilter, imageFilterHover, kenBurns, kenBurnsSpeed, metaOverlay, hover, captionTypo, captionColor, caption, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding, showSearch, searchBgColor, searchTextColor, searchBorderColor, searchBorderRadius, searchBorderWidth, searchTypo, searchIconColor, searchIconSize, searchHeight, showSort, showCountBadge, sortColors, sortBorderColor, sortTypo, countColors, countTypo };

	return <>
		<InspectorControls>
			<TabPanel className='bPlTabPanel' activeClass='activeTab' tabs={generalStyleTabs} onSelect={tabController}>{tab => <>
				{'general' === tab.name && <>
					<General {...generalProps} />
					<ReorderPhotos selectedPhotos={selectedPhotos} setAttributes={setAttributes} />
					<FocalPoint selectedPhotos={selectedPhotos} focalPoint={focalPoint} coverImage={coverImage} setAttributes={setAttributes} />
					<AltText selectedPhotos={selectedPhotos} setAttributes={setAttributes} />
				</>}

				{'style' === tab.name && <>
					<Style {...styleProps} />
					<ImportExport attributes={attributes} setAttributes={setAttributes} />
				</>}
			</>}</TabPanel>
		</InspectorControls>
	</>;
};
export default Settings;