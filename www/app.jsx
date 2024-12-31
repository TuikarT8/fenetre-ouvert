import React, { useState } from 'react';
import { Navbar } from './common/navbar';
import { Home } from './features/home/home';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Inventory } from './features/inventory';
import { InventoryProvider } from './provider';
import { makeStyles } from '@fluentui/react-components';
import { NavigationDrawer } from './nav-drawer';
import { InventoriesTable } from './features/inventory/inventories';
import { Login } from './login';
import { ProtectedRoute } from './common/protected-route';
import { SinginUp } from './SinginUp';

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
							<Route
								index
								path="/"
								element={
									<ProtectedRoute>
										<Home />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/inventories/:inventoryId"
								element={
									<ProtectedRoute>
										<Inventory />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/inventories"
								element={
									<ProtectedRoute>
										<InventoriesTable />
									</ProtectedRoute>
								}
							/>
							<Route path="/login" element={<Login />}></Route>
							<Route path="/signinup" element={<SinginUp />}></Route>
						</Routes>
					</InventoryProvider>
				</section>
			</section>
		</BrowserRouter>
	);
}
