import React, { useState, useEffect, useMemo } from 'react';
import {
	TableBody,
	TableCell,
	TableRow,
	Table,
	TableHeader,
	TableHeaderCell,
	TableCellLayout,
	Option,
	makeStyles,
} from '@fluentui/react-components';
import axios from 'axios';
import { CaretLeftFilled, CaretRightFilled } from '@fluentui/react-icons';
import {
	Toolbar,
	ToolbarButton,
	ToolbarDivider,
	Dropdown,
} from '@fluentui/react-components';
import _ from 'lodash';
import { GoodDrawer } from './good-drawer';

const columns = [
	{ columnKey: 'good', label: 'Bien' },
	{ columnKey: 'date', label: 'Date' },
	{ columnKey: 'condition', label: 'Condition' },
	{ columnKey: 'quantity', label: 'Quantité' },
	{ columnKey: 'value', label: 'Valeur' },
];

const useStyles = makeStyles({
	goodName: {
		cursor: 'pointer',
		':hover': {
			textDecoration: 'underline',
		},
	},
});

function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

function ConvertStringToDate(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		const date = new Date(elem);
		return date.toLocaleDateString();
	}
}

const pageSize = 10;

export const GoodsTable = () => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [isGoodDrawerOpen, setIsGoodDrawerOpen] = useState(false);
	const [selectedGood, setSelectedGood] = useState(null);
	const [pages, setPages] = useState(0);
	const goods = useMemo(() => {
		const start = page * pageSize;
		return data.slice(start, start + pageSize);
	}, [page, JSON.stringify(data)]);
	const styles = useStyles();

	useEffect(() => {
		axios
			.get('/api/goods')
			.then(({ data }) => {
				setPage(0);
				setData(data);
				setPages(Math.ceil(data.length / pageSize));
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

	const toolbar = (
		<Toolbar aria-label="Default">
			<ToolbarButton
				aria-label="Increase Font Size"
				appearance="secondary"
				icon={<CaretLeftFilled />}
				onClick={() => {
					if (page > 0) {
						setPage(page - 1);
					}
				}}
			/>
			<ToolbarDivider />
			<Dropdown id="dropdown-id" value={page + 1}>
				{pages > 0
					? new Array(pages).fill(0).map((elm, index) => {
							return (
								<Option
									onClick={() => setPage(index)}
									key={`page-${index}`}
									text={`Page ${index + 1}`}
									value={index + 1}>
									Page {index + 1}
								</Option>
							);
						})
					: null}
			</Dropdown>
			<ToolbarDivider />
			<ToolbarButton
				aria-label="More"
				appearance="secondary"
				icon={<CaretRightFilled />}
				onClick={() => {
					if (page < data.length) {
						setPage(page + 1);
					}
				}}
			/>
		</Toolbar>
	);

	return (
		<div>
			{toolbar}
			<Table
				arial-label="Default table"
				style={{ minWidth: '510px', cursor: 'pointer' }}>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHeaderCell key={column.columnKey}>
								{column.label}
							</TableHeaderCell>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{goods.map((item) => (
						<TableRow key={item.name}>
							<TableCell className={styles.goodName}>
								<TableCellLayout
									onClick={() => {
										setIsGoodDrawerOpen(true);
										setSelectedGood(item);
									}}>
									{capitalizeFirstLetter(item.name)}
								</TableCellLayout>
							</TableCell>
							<TableCell>
								{_.last(item.changes) && (
									<TableCellLayout key={_.last(item.changes).id}>
										{ConvertStringToDate(_.last(item.changes).date)}
									</TableCellLayout>
								)}
							</TableCell>
							<TableCell>
								{_.last(item.changes) && (
									<TableCellLayout key={_.last(item.changes).id}>
										{capitalizeFirstLetter(_.last(item.changes).condition)}
									</TableCellLayout>
								)}
							</TableCell>
							<TableCell>
								<TableCellLayout>{item.count}</TableCellLayout>
							</TableCell>

							<TableCell>
								<TableCellLayout>{item.purchaseValue}</TableCellLayout>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{toolbar}
			<GoodDrawer
				isOpen={isGoodDrawerOpen}
				selectedGood={selectedGood}
				onClose={() => setIsGoodDrawerOpen(false)}
			/>
		</div>
	);
};
