import { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow, TabPanel, SelectControl, RangeControl, __experimentalUnitControl as UnitControl, __experimentalBoxControl as BoxControl, TextControl, ToggleControl } from '@wordpress/components';

import { produce } from 'immer';

// Settings Components
import { ColorsControl, Label, Typography } from '../../bpl-tools/Components';
import { BDevice, BorderControl } from '../../bpl-tools/Components/Deprecated';

import { tabController } from '../../bpl-tools/utils/functions';
import { emUnit, perUnit, pxUnit } from '../../bpl-tools/utils/options';
import { favoriteOpt, generalStyleTabs, layoutShowOpt, mediaTypeOpt, photosOpt, ratioOpt } from './utils/options';
import { getAlbumList } from './utils/functions';
import General from './Components/Settings/General/General';
import Style from './Components/Settings/Style/Style';


const Settings = ({ attributes, setAttributes, token }) => {
	const { photosType, favorite, albumId, mediaType, columns, columnGap, rowGap, coverImage, imgBorder, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding, layoutShow, album } = attributes;
	const [device, setDevice] = useState('desktop');
	const [albumList, setAlbumList] = useState([]);
	const { title, isTitle } = album;


	useEffect(() => {
		const getPhotos = async () => {
			console.log("api call...");

			if (token?.access_token) {
				const response = await getAlbumList(token?.access_token);
				setAlbumList(response?.data?.albums);
			}
		}
		getPhotos();
	}, [token]);

	// List of Album 
	const categoriesOpt = albumList?.map((album) => {
		return { label: album.title, value: album.id }
	});

	const generalProps = { setAttributes, photosType, favorite, albumId, mediaType, columns, columnGap, rowGap, coverImage, layoutShow, album, categoriesOpt };

	const styleProps = { setAttributes, imgBorder, loadMoreBtnTypo, loadMoreBtnColors, loadMoreBtnBorder, loadMoreBtnPadding };

	return <>
		<InspectorControls>
			<TabPanel className='bPlTabPanel' activeClass='activeTab' tabs={generalStyleTabs} onSelect={tabController}>{tab => <>
				{'general' === tab.name && <>
					<General {...generalProps} />
				</>}

				{'style' === tab.name && <>
					<Style {...styleProps} />
				</>}
			</>}</TabPanel>
		</InspectorControls>
	</>;
};
export default Settings;