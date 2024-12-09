import React from 'react';
import { Navbar } from './common/navbar';
import { Home } from './features/home/home';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Inventory } from './features/inventory';
import { InventoryProvider } from './provider';

export function App() {
	return (
		<div>
			<Navbar />
			<InventoryProvider>
				<BrowserRouter>
					<Routes>
						<Route index path="/" element={<Home />} />
						<Route path="/inventories/:inventoryId" element={<Inventory />}  />
					</Routes>
				</BrowserRouter>
			</InventoryProvider>
		</div>
	);
}
