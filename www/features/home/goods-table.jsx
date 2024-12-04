import React, { useState } from 'react';
import {
	TableBody,
	TableCell,
	TableRow,
	Table,
	TableHeader,
	TableHeaderCell,
	TableCellLayout,
	makeStyles,
	Caption1,
} from '@fluentui/react-components';
import { CaretLeftFilled, CaretRightFilled } from '@fluentui/react-icons';
import {
	Toolbar,
	ToolbarButton,
	ToolbarDivider,
} from '@fluentui/react-components';
import _ from 'lodash';
import { GoodDrawer } from './good-drawer';
import { useGoodsPagination } from '../../provider';

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

export const GoodsTable = () => {
	const {
		advanceGoodsPage,
		retrogradeGoodsPage,
		goods,
		pagesCount,
		pageIndex,
	} = useGoodsPagination();
	const [isGoodDrawerOpen, setIsGoodDrawerOpen] = useState(false);
	const [selectedGood, setSelectedGood] = useState(null);
	const styles = useStyles();

	const toolbar = (
		<Toolbar aria-label="Default">
			<ToolbarButton
				aria-label="Increase Font Size"
				appearance="secondary"
				icon={<CaretLeftFilled />}
				onClick={retrogradeGoodsPage}
			/>
			<ToolbarDivider />
			<Caption1>
				Page {pageIndex + 1}/{pagesCount}
			</Caption1>
			<ToolbarDivider />
			<ToolbarButton
				aria-label="More"
				appearance="secondary"
				icon={<CaretRightFilled />}
				onClick={advanceGoodsPage}
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
