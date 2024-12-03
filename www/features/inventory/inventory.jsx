import React from 'react';
import { InventoryTable } from './inventory-table';
import { Title3 } from '@fluentui/react-components';

export function Inventory() {
	return (
		<div>
			<Title3>{"Table d'inventaire"}</Title3>
			<InventoryTable />
		</div>
	);
}
