import React, { useContext, useEffect, useState } from 'react';
import { Context } from './context';
import PropTypes from 'prop-types';
import axios from 'axios';
import { uniqBy } from 'lodash';

const pageSize = 10;

export function InventoryProvider({ children }) {
	const [goods, setGoods] = useState([]);
	const [sessions, setSessions] = useState([]);
	const [activeSession, setActiveSession] = useState([]);

	function addGood(good) {
		setGoods([...goods, good]);
	}

	function addGoods(goods) {
		setGoods(uniqBy([...goods, ...goods], (good) => good.id));
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
			.get('/api/goods')
			.then(({ data }) => {
				addGoods(data.goods);
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

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
			}}>
			{children}
		</Context>
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
		if (pageIndex >= pagesCount) return;
		setPageIndex(pageIndex + 1);

		if (pageIndex <= pagesCacheCounter) {
			const startIndex = (pageIndex + 1) * pageSize;
			setPageGoods(goods.slice(startIndex, startIndex + pageSize - 1));
		} else {
			setPagesCacheCounter(pagesCacheCounter + 1);
		}
	}

	function retrogradeGoodsPage() {
		if (pageIndex <= 0) return;
		setPageIndex(pageIndex - 1);

		const startIndex = pageIndex * pageSize;
		setPageGoods(goods.slice(startIndex, startIndex + pageSize - 1));
	}

	useEffect(() => {
		axios
			.get(`/api/goods?startAt=${(pageIndex + 1) * pageSize}&count=${pageSize}`)
			.then(({ data }) => {
				addGoods(data.goods);
				setPageGoods(data.goods);
				setPagesCount(Math.ceil(data.total / pageSize));
			})
			.catch((e) => {
				console.error(e);
			});
	}, [pagesCacheCounter]);

	return {
		retrogradeGoodsPage,
		advanceGoodsPage,

		goods: pageGoods,
		pagesCount,
		pageIndex,
	};
}
