import React from 'react';
import { InventoryTable } from './inventory-table';

import {
	Breadcrumb,
	BreadcrumbButton,
	BreadcrumbDivider,
	BreadcrumbItem,
	Spinner,
} from '@fluentui/react-components';

export function Inventory() {
	return (
		<div>
			<Breadcrumb aria-label="Breadcrumb default example">
				<BreadcrumbItem>
					<BreadcrumbButton href={'/'}>{'Accueil'}</BreadcrumbButton>
				</BreadcrumbItem>
				<BreadcrumbDivider />
				<BreadcrumbItem>
					<BreadcrumbButton>{"Table d'inventaire"}</BreadcrumbButton>
				</BreadcrumbItem>
			</Breadcrumb>
			<InventoryTable />
		</div>
	);
}
