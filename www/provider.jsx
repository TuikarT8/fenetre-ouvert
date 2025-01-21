import React, { useContext, useEffect, useState } from 'react';
import { Context } from './features/user/context';
import PropTypes from 'prop-types';
import axios from 'axios';
import { uniq, uniqBy } from 'lodash';
import { hashGoods } from './common';

const pageSize = 10;

export function InventoryProvider({ children }) {
	const [goods, setGoods] = useState([]);
	const [sessions, setSessions] = useState([]);
	const [activeSession, setActiveSession] = useState();

	function addGood(good) {
		setGoods([...goods, good]);
	}

	function addGoods(newGoods) {
		setGoods(uniq([...goods, ...(newGoods || [])]));
	}

	function addSession(session) {
		setSessions(uniqBy([...sessions, session], (session) => session.id));
	}

	function removeGood(good) {
		setGoods(goods.filter((g) => g.id !== good.id));
	}

	function removeSession(session) {
		setSessions(sessions.filter((s) => s.id !== session.id));
	}

	useEffect(() => {
		axios
			.get('/api/goods?skip=0&count=10')
			.then(({ data }) => {
				addGoods(data.goods);
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

	return (
		<Context.Provider
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
			}}>
			{children}
		</Context.Provider>
	);
}

InventoryProvider.propTypes = {
	children: PropTypes.any.isRequired,
};

export function useInventory() {
	const context = useContext(Context);

	return context;
}

export function useGoodsPagination() {
	const { goods, addGoods } = useInventory();
	const [pageIndex, setPageIndex] = useState(0);
	const [pagesCount, setPagesCount] = useState(0);
	const [pagesCacheCounter, setPagesCacheCounter] = useState(0);
	const [pageGoods, setPageGoods] = useState(goods.slice(0, pageSize - 1));

	function advanceGoodsPage() {
		if (pageIndex >= pagesCount - 1) return;

		const newPageIndex = pageIndex + 1;
		setPageIndex(newPageIndex);

		if (newPageIndex > pagesCacheCounter) {
			setPagesCacheCounter(newPageIndex);
		} else {
			const startIndex = newPageIndex * pageSize;
			setPageGoods(goods.slice(startIndex, startIndex + pageSize - 1));
		}
	}

	function retrogradeGoodsPage() {
		if (pageIndex <= 0) return;

		const newPageIndex = pageIndex - 1;
		setPageIndex(newPageIndex);

		const startIndex = newPageIndex * pageSize;
		setPageGoods(goods.slice(startIndex, startIndex + pageSize - 1));
	}

	useEffect(() => {
		axios
			.get(`/api/goods?skip=${pageIndex * pageSize}&count=${pageSize}`)
			.then(({ data }) => {
				addGoods(data.goods);
				setPagesCount(Math.ceil(data.total / pageSize));
			})
			.catch((e) => {
				console.error(e);
			});
	}, [pagesCacheCounter]);

	useEffect(() => {
		const startIndex = pageIndex * pageSize;
		setPageGoods(goods.slice(startIndex, startIndex + pageSize - 1));
	}, [hashGoods(goods), pageIndex]);

	return {
		retrogradeGoodsPage,
		advanceGoodsPage,

		goods: pageGoods,
		pagesCount,
		pageIndex,
	};
}
