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
			console.warn('Cookie not present, redirecting to /login');
			return;
		}

		axios
			.post('/api/auth/verify', {})
			.then(({ data }) => {
				if (data.valid) {
					setCanRenderContent(true);
				} else {
					console.warn('Forbidden, redirecting to /login');

					const otherCookies = cookieParts.filter((part) =>
						part.trim().startsWith('jwt'),
					);
					document.cookie = otherCookies.map((part) => part.trim()).join('; ');
					navigate('/login');
				}
			})
			.catch((e) => {
				console.error(e);
				console.warn('Error, redirecting to /error ');
				navigate('/error');
				return;
			});
	}, []);

	return canRenderContent ? <>{children}</> : null; // TODO instead of null, render a spinner
}

ProtectedRoute.propTypes = {
	children: PropTypes.object.isRequired,
};
