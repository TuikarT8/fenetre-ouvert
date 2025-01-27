import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

export const AppContext = createContext({
	roles: [],
	permissions: [],
	currentSession: null,
	activeSession: null,
	sessions: [],
	goods: [],

	setActiveSession: () => {},
	setCurrentSession: () => {},
	setGoods: () => {},
	setSessions: () => {},
	setCurrentGoods: () => {},
	setStagingGoods: () => {},
});

/**
 * Hook to use the app context
 */
export function useAppContext() {
	return useContext(AppContext);
}

/**
 * Hook to use the app context
 * @returns {{roles: string[], permissions: [], valid: boolean}}
 */
export function useAppContextData() {
	const [authData, setAuthData] = useState({});
	const [sessions, setSessions] = useState([]);
	const [goods, setGoods] = useState([]);
	const [activeSession, setActiveSession] = useState(null);
	const [currentSession, setCurrentSession] = useState(activeSession);
	const [currentGoods, setCurrentGoods] = useState([]);
	const [stagingGoods, setStagingGoods] = useState([]);

	useEffect(() => {
		const effector = () => {
			axios
				.get('/api/auth/verify')
				.then(({ data }) => {
					setAuthData(data);
				})
				.catch((e) => console.error(e));
		};

		effector();

		const interval = setInterval(effector, 1000 * 60);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const sessions$ = axios.get('/api/sessions');
		const activeSession$ = axios.get('/api/sessions/active');
		const goods$ = axios.get('/api/goods');

		Promise.all([sessions$, activeSession$, goods$])
			.then(([sessionsResult, activeSessionResult, goodsResult]) => {
				const sessions = sessionsResult.data;
				const activeSession = activeSessionResult.data;
				const goods = goodsResult.data;

				setSessions(sessions.sessions);
				setActiveSession(activeSession);
				setGoods(goods);
				setCurrentSession(activeSession);
			})
			.catch(console.error);
	}, []);

	if(!currentSession) {
		console.log("Il n'a pas de biens qui ne sont pas  dans la session courante", currentSession?.goodsNotInSession)
	}

	console.log("Voici les biens qui ne sont pas dans la session courante", currentSession)


	return {
		auth: authData,
		goods,
		sessions,
		activeSession,
		currentSession,
		currentGoods,
		stagingGoods,

		setCurrentSession,
		setActiveSession,
		setStagingGoods,
		setCurrentGoods,
		setSessions,
		setGoods,
	};
}
