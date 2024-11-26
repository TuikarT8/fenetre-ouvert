import React, { useState } from 'react';
import { Context } from './context';

export function InventoryProvider() {
	const [goods, setGoods] = useState([]);
	const [sessions, setSessions] = useState([]);
	const [activeSession, setActiveSession] = useState([]);

	function addGood(good) {
		setGoods([...goods, good]);
	}

	function addGoods(goods) {
		setGoods([...goods, ...goods]);
	}

	function addSession(session) {
		setSessions([...sessions, session]);
	}

	function removeGood(good) {
		setGoods(goods.filter((g) => g.id !== good.id));
	}

	function removeSession(session) {
		setSessions(sessions.filter((s) => s.id !== session.id));
	}

	return (
		<Context
			value={{
				goods,
				sessions,
				session: activeSession,
				// Modifiers
				setActiveSession,
				setGoods,
				setSessions,
				addGood,
				addGoods,
				removeGood,
				removeSession,
				addSession,
			}}></Context>
	);
}
