import React, { useState, useEffect } from 'react';
import {
	EditRegular,
	DeleteRegular,
	AddFilled,
	WarningFilled,
} from '@fluentui/react-icons';
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
	makeStyles,
	themeToTokensObject,
	webLightTheme,
	Tooltip,
	Caption2,
	Title1,
} from '@fluentui/react-components';
import axios from 'axios';
import _, { cloneDeep } from 'lodash';
import { useParams } from 'react-router-dom';
import { GoodEditorDrawer } from './good-editor-drawer';
import { ConfimationDialog } from '../../common/dialogs/confimation-dialog';
import { InventoryMessageBox } from './message-box';
import { InventoryToolbar } from './inventory-toolbar';
import { GoodsNotInSessionDrawer } from './missing-good-product';
import { capitalizeFirstLetter, convertStringToDate } from '../../common';
import { useInventory } from '../../provider';
import QRCode from 'react-qr-code';

const columns = [
	{ columnKey: 'good', label: 'Bien' },
	{ columnKey: 'date', label: 'Date' },
	{ columnKey: 'condition', label: 'Condition' },
	{ columnKey: 'quantity', label: 'Quantité' },
	{ columnKey: 'value', label: 'Valeur' },
	{ columnKey: 'Actions', label: 'Actions' },
	{ columnKey: 'Qrcode', label: 'Qrcode' },
];

const tokens = themeToTokensObject(webLightTheme);
const useStyles = makeStyles({
	foreignRow: {
		color: tokens.colorStatusWarningForeground3,
	},

	captionText: {
		color: tokens.colorPaletteBeigeBorderActive,
	},

	tableCell: {
		display: 'flex',
		flexDirection: 'row',
		height: 'fit-content',
		width: 'fit-content',
	},
});

export const InventoryTable = () => {
	const styles = useStyles();
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

	const contactTheServerToCreateAnAssetInTheCurrentSession = (
		good,
		lastChange,
	) => {
		const change = cloneDeep(lastChange);
		change.sessionId = session.sessionId;

		axios
			.post(`/api/goods/${good.id}/changes`, change)
			.then(() => {
				moveGoodNotInSessionToGoodsInSession(good, change);
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const moveGoodNotInSessionToGoodsInSession = (good, change) => {
		const changesToAdd = change ? [change] : [];
		setActiveSession({
			...session,
			goods: [
				...session.goods,
				{ ...good, changes: [...(good.changes || []), ...changesToAdd] },
			],
			goodsNotInSession: (session.goodsNotInSession || []).filter(
				(g) => g.id !== good.id,
			),
		});
		console.log({
			...session,
			goods: [
				...session.goods,
				{ ...good, changes: [...(good.changes || []), ...changesToAdd] },
			],
			goodsNotInSession: (session.goodsNotInSession || []).filter(
				(g) => g.id !== good.id,
			),
		});
	};

	const handleDeleteGood = () => {
		axios
			.delete(`/api/goods/${goodToDelete.id}/changes/${session?.sessionId}`)
			.then(function () {
				setGoodToDelete(undefined);
				setActiveSession({
					...session,
					goods: (session.goods || []).filter((g) => g.id !== goodToDelete.id),
					goodsNotInSession: (session.goodsNotInSession || []).filter(
						(g) => g.id !== goodToDelete.id,
					),
				});
			})
			.catch((e) => {
				console.error(e);
			});
	};

	return (
		<div>
			{!!session?.active || <Title1>{"Aucune session n'est active"}</Title1>}

			{!!session?.goodsNotInSession?.length && (
				<InventoryMessageBox
					count={session?.goodsNotInSession?.length || 0}
					onShowGoods={() => setIsGoodsNotInSessionDrawerOpen(true)}
				/>
			)}
			{!!session?.active && <InventoryToolbar sessionId={inventoryId} />}
			{!!session?.active && (
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
									<TableCell
										role="gridcell"
										tabIndex={0}
										{...focusableGroupAttr}>
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

						{(session?.goodsNotInSession || []).map((item) => {
							const change = _.last(item.changes);

							return (
								<TableRow key={item.id} className={styles.foreignRow}>
									<TableCell className={styles.tableCell}>
										<TableCellLayout
											onClick={() => {
												setSelectedGood(item);
												setIsDisabled(true);
											}}>
											<Tooltip
												content="Ce bien n'est pas encore inclut dans la session active"
												relationship="label">
												<WarningFilled color="" style={{ margin: '5px' }} />
											</Tooltip>
											{capitalizeFirstLetter(item.name)}
										</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout key={item.id}>
											{convertStringToDate(change?.time || null)}
										</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>
											{capitalizeFirstLetter(change?.condition || null)}
										</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>{item.count}</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>{change?.saleValue}</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>
										{item?.code ? (
											<QRCode
												title="goodQrCode"
												value={selectedGood.code}
												bgColor={'#FFFFFF'}
												fgColor={'#000000'}
												size={128}
												/>
											) : (
												"Le Qr code n'est pas disponible veuillez le fournir"
											)}
										</TableCellLayout>
									</TableCell>
									<TableCell
										role="gridcell"
										tabIndex={0}
										{...focusableGroupAttr}>
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
											<Button
												icon={<AddFilled />}
												aria-label="Add"
												onClick={() => {
													if (change) {
														contactTheServerToCreateAnAssetInTheCurrentSession(
															item,
															change,
														);
													} else {
														setSelectedGood(item);
													}
												}}
											/>
										</TableCellLayout>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}

			{!!session?.active && (
				<Caption2 className={styles.captionText}>
					{session?.goods?.length || 0} biens dans la session /{' '}
					{session?.goodsNotInSession?.length || 0} biens peuvent être ajoutés.
				</Caption2>
			)}

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

			{!!selectedGood && (
				<GoodEditorDrawer
					isOpen={!!selectedGood}
					selectedGood={selectedGood}
					isDisabled={isDisabled}
					onClose={(good, move) => {
						if (move) {
							moveGoodNotInSessionToGoodsInSession({
								...selectedGood,
								...good,
							});
						}

						setSelectedGood();
					}}
					sessionId={session?.id}
				/>
			)}
			{!!isGoodsNotInSessionDrawerOpen && (
				<GoodsNotInSessionDrawer
					open={isGoodsNotInSessionDrawerOpen}
					onClose={() => setIsGoodsNotInSessionDrawerOpen(false)}
				/>
			)}
		</div>
	);
};
