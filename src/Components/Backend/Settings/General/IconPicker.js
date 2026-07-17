import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import { Label } from '../../../../../../bpl-tools/Components';
import { searchIcons } from '../../../../utils/icons';

const IconPicker = ({ value, onChange, label }) => {
	const [isOpen, setIsOpen] = useState(false);
	const currentVal = value || 'search-1';
	const currentIcon = searchIcons[currentVal] || searchIcons['search-1'];

	return (
		<div className="bpgpb-icon-picker-control">
			{label && <Label className="bpgpb-icon-picker-label">{label}</Label>}
			
			<div className="bpgpb-icon-picker-preview-wrap">
				<div className="bpgpb-icon-picker-preview-box">
					{currentIcon}
				</div>
				<Button 
					isSecondary 
					onClick={() => setIsOpen(true)}
					className="bpgpb-icon-picker-trigger-btn"
				>
					{__('Select Icon', 'embed-google-photos')}
				</Button>
			</div>

			{isOpen && (
				<Modal
					title={__('Select Search Icon', 'embed-google-photos')}
					onRequestClose={() => setIsOpen(false)}
					className="bpgpb-icon-picker-modal"
				>
					<div className="bpgpb-icon-picker-grid">
						{Object.entries(searchIcons).map(([key, Icon]) => {
							const isActive = currentVal === key;
							return (
								<button
									key={key}
									type="button"
									className={`bpgpb-icon-picker-btn ${isActive ? 'is-active' : ''}`}
									onClick={() => {
										onChange(key);
										setIsOpen(false);
									}}
									title={key}
								>
									<div className="bpgpb-icon-picker-icon-wrapper">
										{Icon}
									</div>
								</button>
							);
						})}
					</div>
				</Modal>
			)}
		</div>
	);
};

export default IconPicker;
