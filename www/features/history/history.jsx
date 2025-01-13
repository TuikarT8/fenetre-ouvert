import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Listbox, makeStyles, Title1 } from '@fluentui/react-components';
import { tokens, Text } from '@fluentui/react-components';
import { Link } from 'react-router-dom';
import { EntityDrawer } from './entity-drawer';

const useTextStyle = makeStyles({
	color: tokens.colorNeutralForeground1,
	listbox: {
		display: 'flex',
		flexDirection: 'row',
	},
	text: {
		cursor: 'pointer',
	},
});

const actionToText = {
	created: 'a créé',
	updated: 'a modifié',
	deleted: 'a supprimé',
};

const entityToText = {
	users: 'un utilisateur',
	sessions: 'une session',
	groups: 'un groupe',
	goods: 'un bien',
};

export function History() {
	const textStyle = useTextStyle();
	const [events, setEvents] = useState([]);
	const [event, setEvent] = useState();

	useEffect(() => {
		axios
			.get(`/api/events`)
			.then(({ data }) => {
				setEvents(data);
				console.log('sessions', data);
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

	return (
		<div>
			<Title1>{'Historique'}</Title1>
			{events.map((item) => (
				<Listbox key={item.id} className={textStyle.listbox}>
					&nbsp;
					<Text className={textStyle.text}>
						<Link to={`/users/${item.author.id}`}>{item.author.name}</Link>
					</Text>
					&nbsp;
					<Text className={textStyle}>{actionToText[item.action]}</Text>&nbsp;
					<Text
						className={textStyle}
						onClick={() => {
							setEvent(item);
						}}>
						<Link>{entityToText[item.entity]}</Link>{' '}
					</Text>
				</Listbox>
			))}
			{event && (
				<EntityDrawer
					entityId={event.entityId}
					isOpen={!!event}
					entityGroup={event.entity}
					onClose={() => {
						setEvent();
					}}
				/>
			)}
		</div>
	);
}
