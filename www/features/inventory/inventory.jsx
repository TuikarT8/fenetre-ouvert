import React from 'react';
import { InventoryTable } from './inventory-table';
import { InventoryToolbar } from './inventory-toolbar';

export function Inventory() {
	return (
		<div>
			<h1>{"Table d'inventaire"}</h1>
				<InventoryToolbar/>
				<InventoryTable />
		</div>
	);
}
