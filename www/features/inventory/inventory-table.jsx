import React, { useState, useEffect } from 'react';

function convertStringToDate(dateString) {
	console.log('The date to convert is', dateString);
	if (dateString === undefined || dateString === null) {
		return '';
	}

	const date = new Date(dateString);
	console.log('The converted date is ', date)
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
	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const [goods, setGoods] = useState([]);
	const { inventoryId } = useParams();

	useEffect(() => {
		if (!inventoryId) return;

		axios
			.get('/api/sessions/${session.id}/goods')
			.then(({ data }) => {
				setGoods(data);
				console.log('Voici les donnees', data);
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
				style={{ minWidth: '620px' }}>
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
									<TableCellLayout>
										{capitalizeFirstLetter(item.name)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={change.id}>
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
										<Button icon={<EditRegular />} aria-label="Edit" />
										<Button icon={<DeleteRegular />} aria-label="Delete" />
									</TableCellLayout>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};
