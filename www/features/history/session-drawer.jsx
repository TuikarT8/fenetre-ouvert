import {
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';
import React from 'react';

export function SessionDrawer({ session, isOpen, onClose }) {
	return (
		<Drawer
			open={isOpen}
			position="end"
			size="small"
			onOpenChange={(_, { open }) => {
				if (!open) onClose();
			}}>
			<DrawerHeader>
				<DrawerHeaderTitle>{session?.name || 'Aucun nom'}</DrawerHeaderTitle>
			</DrawerHeader>
			<DrawerBody>
				<p>{session?.name || 'Aucun nom'}</p>
				<p>{session?.count || 'Aucun count'}</p>
			</DrawerBody>
		</Drawer>
	);
}

SessionDrawer.propTypes = {
	session: PropTypes.object.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
