import React, { useState, useEffect } from 'react';

function convertStringToDate(dateString) {
	if (dateString === undefined || dateString === null) {
		return '';
	}

	const date = new Date(dateString);
	return date.toDateString();
}

import { EditRegular, DeleteRegular } from '@fluentui/react-icons';
import {
	TableBody,
	TableCell,
	TableRow,
	Table,
	TableHeader,
	TableHeaderCell,
	TableCellLayout,
	Button,
	useArrowNavigationGroup,
	useFocusableGroup,
} from '@fluentui/react-components';
import axios from 'axios';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { InventoryDrawer } from './inventory-drawer';

const columns = [
	{ columnKey: 'good', label: 'Bien' },
	{ columnKey: 'date', label: 'Date' },
	{ columnKey: 'condition', label: 'Condition' },
	{ columnKey: 'quantity', label: 'Quantité' },
	{ columnKey: 'value', label: 'Valeur' },
	{ columnKey: 'Actions', label: 'action' },
];

function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

export const InventoryTable = () => {
	const [isGoodDrawerOpen, setIsGoodDrawerOpen] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [selectedGood, setSelectedGood] = useState(null);
	const [sessionId, setSessionId] = useState('');
	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const [goods, setGoods] = useState([]);
	const { inventoryId } = useParams();

	useEffect(() => {
		if (!inventoryId) return;

		axios
			.get(`/api/sessions/${inventoryId}/goods`)
			.then(({ data }) => {
				setGoods(data.goods);
				if (data.goods.length) {
					setSessionId(data.sessionId);
				}
			})
			.catch((e) => {
				console.error(e);
			});
	}, [inventoryId]);

	return (
		<div>
			<Table
				{...keyboardNavAttr}
				role="grid"
				aria-label="Table with grid keyboard navigation"
				style={{ minWidth: '620px', cursor: 'pointer' }}>
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
					{goods.map((item) => {
						const change = _.last(item.changes);
						return (
							<TableRow key={item.id}>
								<TableCell>
									<TableCellLayout
										onClick={() => {
											setIsGoodDrawerOpen(true);
											setSelectedGood(item);
											setIsDisabled(true);
										}}>
										{capitalizeFirstLetter(item.name)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={item.id}>
										{convertStringToDate(change.time)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={change.id}>
										{capitalizeFirstLetter(change.condition)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout>{item.count}</TableCellLayout>
								</TableCell>

								<TableCell>
									<TableCellLayout>{change.saleValue}</TableCellLayout>
								</TableCell>
								<TableCell role="gridcell" tabIndex={0} {...focusableGroupAttr}>
									<TableCellLayout>
										<Button
											icon={<EditRegular />}
											aria-label="Edit"
											onClick={() => {
												setIsGoodDrawerOpen(true);
												setSelectedGood(item);
												setIsDisabled(false);
											}}
										/>
										<Button icon={<DeleteRegular />} aria-label="Delete" />
									</TableCellLayout>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<InventoryDrawer
				isOpen={isGoodDrawerOpen}
				selectedGood={selectedGood}
				isDisabled={isDisabled}
				onClose={() => setIsGoodDrawerOpen(false)}
				sessionId={sessionId}
			/>
		</div>
	);
};
