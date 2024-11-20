import React from 'react';
import { InventoryTable } from './inventory-table';

export function Inventory() {
	return (
		<div>
			<h1>{"Table d'inventaire"}</h1>
			<InventoryTable />
		</div>
	);
}
