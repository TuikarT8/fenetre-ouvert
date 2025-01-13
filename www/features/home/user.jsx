import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function User() {
	const { id } = useParams();
	const [user, setUser] = useState(null)
	useEffect(() => {
		if (!id) {
			return;
		}
		axios
			.get(`/api/users/${id}`)
			.then(({ data }) => {
				setUser(data);
			})
			.catch((e) => {
				console.error(e);
			});
	}, [id]);

	return (<div>
		<p>{user?.firstname}</p>
		<p>{user?.lastname}</p>
		<p>{user?.emailAddress}</p>
		<p>{user?.condition}</p>
		<p>{user?.Roles}</p>
	</div>);
}
