import {
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';
import React from 'react';

export function NotEntityDrawer({ isOpen, onClose }) {
	return (
		<Drawer
			open={isOpen}
			position="end"
			size="small"
			onOpenChange={(_, { open }) => {
				if (!open) onClose();
			}}>
			<DrawerHeader>
				<DrawerHeaderTitle>{'Not Entity'}</DrawerHeaderTitle>
			</DrawerHeader>
			<DrawerBody>
				<p>{'Aucun Entite ne correspond'}</p>
			</DrawerBody>
		</Drawer>
	);
}

NotEntityDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
