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
} from '@fluentui/react-components';
import axios from 'axios';
import { CaretLeftFilled, CaretRightFilled } from '@fluentui/react-icons';
import {
	Toolbar,
	ToolbarButton,
	ToolbarDivider,
	Dropdown,
} from '@fluentui/react-components';

const columns = [
	{ columnKey: 'Bien', label: 'Bien' },
	{ columnKey: 'Date', label: 'Date' },
	{ columnKey: 'Condition', label: 'Condition' },
	{ columnKey: 'Nombre de bien', label: 'Nombre de bien' },
	{ columnKey: 'valeur', label: 'Valeur' },
];

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

export const Tables = () => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [pages, setPages] = useState(0);
	const goods = useMemo(() => {
		const start = page * pageSize;
		return data.slice(start, start + pageSize);
	}, [page, JSON.stringify(data)]);

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

	return (
		<div>
			<Table arial-label="Default table" style={{ minWidth: '510px' }}>
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
							<TableCell>
								<TableCellLayout>
									{capitalizeFirstLetter(item.name)}
								</TableCellLayout>
							</TableCell>
							<TableCell>
								{item.changes?.map((itm) => (
									<TableCellLayout key={itm.id}>
										{ConvertStringToDate(itm.time)}
									</TableCellLayout>
								))}
							</TableCell>
							<TableCell>
								{item.changes?.map((itm) => (
									<TableCellLayout key={itm.id}>
										{capitalizeFirstLetter(itm.condition)}
									</TableCellLayout>
								))}
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

				<Dropdown
					id="dropdown-id"
          value={page+1}>
					{pages > 0
						? new Array(pages).fill(0).map((elm, index) => {
								return (
									<Option
										onClick={() => setPage(index)}
										key={`page-${index}`}
										text={`Page ${index + 1}`}
										value={index+1}>
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
		</div>
	);
};
