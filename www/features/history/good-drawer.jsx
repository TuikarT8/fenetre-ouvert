import {
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';
import React from 'react';

export function GoodDrawer({ good, isOpen, onClose }) {
	console.log('GoodDrawer and isOpen', good, isOpen);
	if (!good) return null;

	return (
		<Drawer
			open={isOpen}
			position="end"
			size="small"
			onOpenChange={(_, { open }) => {
				if (!open) onClose();
			}}>
			<DrawerHeader>
				<DrawerHeaderTitle>{good?.name || 'Aucun nom'}</DrawerHeaderTitle>
			</DrawerHeader>
			<DrawerBody>
				<p>{good?.name || 'Aucun nom'}</p>
				<p>{good?.description || 'Aucun description'}</p>
				<p>{good?.count || 'Aucun count'}</p>
			</DrawerBody>
		</Drawer>
	);
}

GoodDrawer.propTypes = {
	good: PropTypes.object.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
