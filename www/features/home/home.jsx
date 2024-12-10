import React, { useEffect, useState } from 'react';
import './dashboard.scss';
import { Caption1, Title1, Title2 } from '@fluentui/react-components';
import {
	BarcodeScanner24Filled,
	TextBulletListSquare32Filled,
	WalletCreditCard32Regular,
} from '@fluentui/react-icons';
import { GoodsTable } from './goods-table';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const Home = () => {
	const [hasActiveSession, setHasActiveSession] = useState(false);

	useEffect(() => {
		axios
			.get(`/api/hasActiveSession`)
			.then(({ data }) => {
				setHasActiveSession(data.exists);
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

	return (
		<div className="main">
			<Title1>Acceuil</Title1>
			<div className="container">
				<div className="card">
					<div className="header">
						<Title2>308 Biens</Title2>
						<span className="flex-expand" />
						<span className="icons-1">
							<BarcodeScanner24Filled />
						</span>
					</div>
					<Caption1>Nombre de biens actuellement enregistrés</Caption1>
				</div>
				<div className="card card-2">
					<div className="header">
						<Title2>308 Inventaires</Title2>
						<span className="flex-expand" />
						<span className="icons-2">
							<TextBulletListSquare32Filled />
						</span>
					</div>
					<Caption1>Inventaires realisés</Caption1>
				</div>
				<div className="card">
					<div className="header">
						<Title2>1 789$</Title2>
						<span className="flex-expand" />
						<span className="icons-3">
							<WalletCreditCard32Regular />
						</span>
					</div>
					<Caption1>{`Valeur marchande de l'inventaire`}</Caption1>
				</div>
			</div>
			{hasActiveSession && (
				<Link
					to="/inventories/active"
					replace={true}>{`Continuer l'inventaire en cours`}</Link>
			)}
			<GoodsTable />
		</div>
	);
};
