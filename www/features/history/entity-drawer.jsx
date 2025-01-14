import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import axios from 'axios';
import { SessionDrawer } from './session-drawer';
import { UserDrawer } from './user-drawer';
import { GoodDrawer } from './good-drawer';
import { NotEntityDrawer } from './notentity-drawer';

export const EntityDrawer = ({ isOpen, entityGroup, entityId, onClose }) => {
	const [entity, setEntity] = useState(null);
	console.log("Voici le donnees de l'url", entityGroup, entityId);

	useEffect(() => {
		if (!entityId) return;
		console.log("Voici le donnees de l'url", entityGroup, entityId);

		axios
			.get(`/api/${entityGroup}/${entityId}`)
			.then(({ data }) => {
				if (data) {
					setEntity(data);
				}
			})
			.catch(console.error);
	}, [entityId]);

	console.log(isOpen);

	switch (entityGroup) {
		case 'goods':
			return (
				<GoodDrawer
					good={entity}
					isOpen={isOpen}
					onClose={() => onClose(false)}
				/>
			);
		case 'sessions':
			return (
				<SessionDrawer
					session={entity}
					isOpen={isOpen}
					onClose={() => onClose(false)}
				/>
			);
		case 'users':
			return (
				<UserDrawer
					user={entity}
					isOpen={isOpen}
					onClose={() => onClose(false)}
				/>
			);
		default:
			return (
				<NotEntityDrawer
					notEntity={entity}
					isOpen={isOpen}
					onClose={() => onClose(false)}
				/>
			);
	}
};

EntityDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	entityId: PropTypes.string.isRequired,
	entityGroup: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
};
