import React from 'react';
import { Navbar } from './common/navbar';
import { Home } from './features/home/home';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Inventory } from './features/inventory';

export function App() {
	return (
		<div>
			<Navbar />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/inventories/{id}" element={<Inventory />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}
