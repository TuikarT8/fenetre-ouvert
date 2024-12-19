import * as React from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	useRestoreFocusSource,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import './good-drawer.scss';
import { GoodCard } from '../../common/good-card';
import QRCode from 'react-qr-code';

export const GoodDrawer = ({ isOpen, selectedGood, onClose }) => {
	// Overlay Drawer will handle focus by default, but inline Drawers need manual focus restoration attributes, if applicable
	const restoreFocusSourceAttributes = useRestoreFocusSource();

	if (!selectedGood) return null;

	return (
		<Drawer
			{...restoreFocusSourceAttributes}
			separator
			open={isOpen}
			position="end"
			size="medium"
			onOpenChange={(_, { open }) => {
				if (!open) onClose();
			}}>
			<DrawerHeader>
				<DrawerHeaderTitle
					action={
						<Button
							appearance="subtle"
							aria-label="Close"
							icon={<Dismiss24Regular />}
							onClick={() => onClose()}
						/>
					}>
					{selectedGood.name}
				</DrawerHeaderTitle>
			</DrawerHeader>

			<DrawerBody>
				<p>{selectedGood.description}</p>
				<GoodCard></GoodCard>
				{selectedGood?.code ? (
					<QRCode
						title="goodQrCode"
						value={selectedGood.code}
						bgColor={'#FFFFFF'}
						fgColor={'#000000'}
						size={128}
					/>
				) : (
					"Le Qr code n'est pas disponible veuillez le fournir"
				)}
			</DrawerBody>
		</Drawer>
	);
};

GoodDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	selectedGood: PropTypes.object,
	onClose: PropTypes.func.isRequired,
};
