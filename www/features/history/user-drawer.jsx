import {
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';
import React from 'react';

export function UserDrawer({ user, isOpen, onClose }) {
	return (
		<Drawer
			open={isOpen}
			position="end"
			size="small"
			onOpenChange={(_, { open }) => {
				if (!open) onClose();
			}}>
			<DrawerHeader>
				<DrawerHeaderTitle>{user?.name || 'Aucun nom'}</DrawerHeaderTitle>
			</DrawerHeader>
			<DrawerBody>
				<p>{user?.name || 'Aucun nom'}</p>
			</DrawerBody>
		</Drawer>
	);
}

UserDrawer.propTypes = {
	user: PropTypes.object.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
