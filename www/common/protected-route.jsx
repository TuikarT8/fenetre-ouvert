import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
	const navigate = useNavigate();

	useEffect(() => {
		const cookieParts = document.cookie.split(';');
		console.log(cookieParts);
		console.log(document.cookie);
		const jwtCookie = cookieParts.find((part) => part.trim().startsWith('jwt'));

		if (!jwtCookie) {
			navigate('/login');
		}
	}, []);

	return <>{children}</>;
}

ProtectedRoute.propTypes = {
	children: PropTypes.object.isRequired,
};
