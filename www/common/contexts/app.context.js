import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

export const AppContext = createContext({
	roles: [],
});

/**
 * Hook to use the app context
 * @returns {{roles: string[], valid: boolean}}
 */
export function useAppContext() {
	return useContext(AppContext);
}

/**
 * Hook to use the app context
 * @returns {{roles: string[], valid: boolean}}
 */
export function useAppContextData() {
	const [data, setData] = useState({});

	useEffect(() => {
		const effector = () => {
			axios
				.get('/api/auth/verify')
				.then(({ data }) => {
					setData(data);
				})
				.catch((e) => console.error(e));
		};

		effector();

		const interval = setInterval(effector, 1000 * 60);

		return () => clearInterval(interval);
	}, []);

	return data;
}
