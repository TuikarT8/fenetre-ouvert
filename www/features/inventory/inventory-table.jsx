import React, { useState, useEffect } from 'react';
import { EditRegular, DeleteRegular } from '@fluentui/react-icons';
import {
	TableBody,
	TableCell,
	TableRow,
	Table,
	TableHeader,
	TableHeaderCell,
	TableCellLayout,
	Button,
	useArrowNavigationGroup,
	useFocusableGroup,
} from '@fluentui/react-components';
import axios from 'axios';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { GoodEditorDrawer } from './good-editor-drawer';
import { ConfimationDialog } from '../../common/dialogs/confimation-dialog';
import { InventoryMessageBox } from './message-box';
import { InventoryToolbar } from './inventory-toolbar';
import { GoodsNotInSessionDrawer } from './missing-good-product';
import { capitalizeFirstLetter, convertStringToDate } from '../../common';
import { useInventory } from '../../provider';

const columns = [
	{ columnKey: 'good', label: 'Bien' },
	{ columnKey: 'date', label: 'Date' },
	{ columnKey: 'condition', label: 'Condition' },
	{ columnKey: 'quantity', label: 'Quantité' },
	{ columnKey: 'value', label: 'Valeur' },
	{ columnKey: 'Actions', label: 'Actions' },
];

export const InventoryTable = () => {
	const { setActiveSession, session } = useInventory();
	const [isGoodsNotInSessionDrawerOpen, setIsGoodsNotInSessionDrawerOpen] =
		useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [selectedGood, setSelectedGood] = useState(null);
	const [goodToDelete, setGoodToDelete] = useState(null);
	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const { inventoryId } = useParams();

	useEffect(() => {
		if (!inventoryId) return;

		axios
			.get(`/api/sessions/${inventoryId}/goods`)
			.then(({ data }) => {
				setActiveSession(data);
			})
			.catch((e) => {
				console.error(e);
			});
	}, [inventoryId]);

	const handleDeleteGood = () => {
		axios
			.delete(`/api/goods/${goodToDelete.id}/changes/${session?.sessionId}`)
			.then(function () {
				setGoodToDelete(undefined);
				setActiveSession({
					...session,
					goods: (session.goods || []).filter(g => g.id !== goodToDelete.id),
				});
			})
			.catch((e) => {
				console.error(e);
			});
	};

	return (
		<div>
			<InventoryMessageBox
				count={session?.goodsNotInSession?.length || 0}
				onShowGoods={() => setIsGoodsNotInSessionDrawerOpen(true)}
			/>
			<InventoryToolbar />
			<Table
				{...keyboardNavAttr}
				role="grid"
				aria-label="Table with grid keyboard navigation"
				style={{ minWidth: '620px', cursor: 'pointer' }}>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHeaderCell key={column.columnKey}>
								{column.label}
							</TableHeaderCell>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{(session?.goods || []).map((item) => {
						const change = _.last(item.changes);
						return (
							<TableRow key={item.id}>
								<TableCell>
									<TableCellLayout
										onClick={() => {
											setSelectedGood(item);
											setIsDisabled(true);
										}}>
										{capitalizeFirstLetter(item.name)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={item.id}>
										{convertStringToDate(change.time)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={change.id}>
										{capitalizeFirstLetter(change.condition)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout>{item.count}</TableCellLayout>
								</TableCell>

								<TableCell>
									<TableCellLayout>{change.saleValue}</TableCellLayout>
								</TableCell>
								<TableCell role="gridcell" tabIndex={0} {...focusableGroupAttr}>
									<TableCellLayout>
										<Button
											icon={<EditRegular />}
											aria-label="Edit"
											onClick={() => {
												setSelectedGood(item);
												setIsDisabled(false);
											}}
										/>
										<Button
											icon={<DeleteRegular />}
											aria-label="Delete"
											onClick={() => {
												setGoodToDelete(item);
											}}
										/>
									</TableCellLayout>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>

			{!!goodToDelete && (
				<ConfimationDialog
					open={!!goodToDelete}
					title={'Suppression de bien'}
					content={
						"Voulez-vous vraiment supprimer ce bien? Ce bien sera visible dans les inventaires précédents mais n'appaîtra plus partant de l'inventaire courant."
					}
					risky
					onClose={(confirmed) =>
						confirmed ? handleDeleteGood() : setGoodToDelete(undefined)
					}
				/>
			)}

			{!!selectedGood && <GoodEditorDrawer
				isOpen={!!selectedGood}
				selectedGood={selectedGood}
				isDisabled={isDisabled}
				onClose={() => setSelectedGood()}
				sessionId={session?.id}
			/>}

			<GoodsNotInSessionDrawer
				open={isGoodsNotInSessionDrawerOpen}
				onClose={() => setIsGoodsNotInSessionDrawerOpen(false)}
			/>
		</div>
	);
};
