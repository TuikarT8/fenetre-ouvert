import React, { useState } from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	useRestoreFocusSource,
	makeStyles,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';
import axios from 'axios';

const useStyles = makeStyles({
	iconPositon: {
		display: 'flex',
		flexDirection: 'rows',
	},
});

export const EntityDrawer = ({ isOpen, entityGroup, entityId, onClose }) => {
	const [entity, setEntity] = useState();
	const styles = useStyles();
	const restoreFocusSourceAttributes = useRestoreFocusSource();

	React.useEffect(() => {
		if (!entityId) return;

		axios
			.get(`/api/${entityGroup}/${entityId}`)
			.then(({ data }) => {
				setEntity(data);
			})
			.catch(console.error);
	});
	
	switch (entityGroup) {
		case 'goods':
			return <GoodDrawer></GoodDrawer>
		case 'session':
			return <SessionDrawer></SessionDrawer>
		case 'users':
			return <UserDrawer></UserDrawer>
		default:
			return <NotEntityDrawer></NotEntityDrawer> 
	}
};

EntityDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	entityId: PropTypes.string.isRequired,
	entityGroup: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
};
