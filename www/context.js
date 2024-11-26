import { createContext } from 'react';

export const Context = createContext({
	goods: [],
	sessions: [],
	session: null,
	// Modifiers
	setActiveSession: () => {},
	setGoods: () => {},
	setSessions: () => {},
	addSession: () => {},
	addGood: () => {},
	addGoods: () => {},
	removeGood: () => {},
	removeSession: () => {},
});
