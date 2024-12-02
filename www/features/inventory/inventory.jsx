import React from 'react';
import { InventoryTable } from './inventory-table';
import { InventoryToolbar } from './inventory-toolbar';
import { InventoryMessageBox } from './message-box';

export function Inventory() {
	return (
		<div>
			<h1>{"Table d'inventaire"}</h1>
			<InventoryMessageBox />
			<InventoryToolbar />
			<InventoryTable />
		</div>
	);
}
