import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function ProtectedRoute({ children }) {
	const navigate = useNavigate();
	const [canRenderContent, setCanRenderContent] = useState(false);

	useEffect(() => {
		const cookieParts = document.cookie.split(';');
		const jwtCookie = cookieParts.find((part) => part.trim().startsWith('jwt'));
		
		if (!jwtCookie) {
			navigate('/login');
			return;
		}

		axios.post('/api/auth/verify', {})
			.then(({ data }) => {
				if (data.valid) {
					setCanRenderContent(true);
				} else {
					navigate('/login');
					cookieParts.filter(part => part.trim().startsWith('jwt'));
					document.cookie = cookieParts.map(part => part.trim()).join('; ');
				}
			}).catch((e) => {
				console.error(e);
				navigate('/error');
				return
			});

	}, []);

	return canRenderContent ? <>{children}</> : null; // TODO instead of null, render a spinner
}

ProtectedRoute.propTypes = {
	children: PropTypes.object.isRequired,
};
