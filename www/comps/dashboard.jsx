import * as React from 'react';
import './dashboard.scss'
import { Caption1, Title2 } from '@fluentui/react-components';
import { BarcodeScanner24Filled, MoreVertical32Filled, TextBulletListSquare32Filled, WalletCreditCard32Regular, WindowBulletListFilled} from '@fluentui/react-icons';


export const DashBoard = () => {
	return (
		<div className='container'> 
			<div className="card">
				<div className="header">
					<Title2>308 Biens</Title2>
					<span className="flex-expand"/>
					<BarcodeScanner24Filled/>
				</div>
				<Caption1>Nombre de biens actuellement enregistres</Caption1>
			</div>  
			<div className="card">
				<div className="header">
					<Title2>308 Inventaires</Title2>
					<span className="flex-expand"/>
					<TextBulletListSquare32Filled />
				</div>
				<Caption1>Inventaires realises</Caption1>
			</div>   
			<div className="card">
				<div className="header">
					<Title2>1 789$</Title2>	
					<span className="flex-expand"/>
					<WalletCreditCard32Regular />
				</div>
				<Caption1>Valeur marchande de l'inventaire</Caption1>
			</div>    
		</div>	
	);
};
