import React, { useState } from 'react';
import { Navbar } from './common/navbar';
import { Home } from './features/home/home';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Inventory } from './features/inventory';
import { InventoryProvider } from './provider';
import { makeStyles } from '@fluentui/react-components';
import { NavigationDrawer } from './nav-drawer';
import { InventoriesTable } from './features/inventory/inventories';

const useStyles = makeStyles({
	main: {
		height: '100%',
		width: '100%',
		display: 'flex',
		maxHeight: '100%',
		flexDirection: 'row',
		overflow: 'hidden',
	},
	rightContent: {
		width: 'calc(100% - 245px)',
		height: '100%',
		maxHeight: '100%',
		display: 'flex',
		flexDirection: 'column',
		overflowY: 'hidden',
		overflowX: 'scroll',
	},
});

export function App() {
	const [isAppNavDrawerOpen, setIsAppNavDrawerOpen] = useState(false);
	const styles = useStyles();

	const toggleAppNavDrawerOpen = () => {
		setIsAppNavDrawerOpen(!isAppNavDrawerOpen);
	};

	return (
		<BrowserRouter>
			<section className={styles.main}>
				<NavigationDrawer
					open={isAppNavDrawerOpen}
					onToggleDrawerOpenState={(open) => setIsAppNavDrawerOpen(open)}
				/>
				<section className={styles.rightContent}>
					<Navbar onToggleAppNavDrawer={() => toggleAppNavDrawerOpen()} />
					<InventoryProvider>
						<Routes>
							<Route index path="/" element={<Home />} />
							<Route path="/inventories/:inventoryId" element={<Inventory />} />
							<Route path="/inventories" element={<InventoriesTable />} />
						</Routes>
					</InventoryProvider>
				</section>
			</section>
		</BrowserRouter>
	);
}
