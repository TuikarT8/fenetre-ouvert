import React, { useState, useEffect } from 'react';
import {
	Edit12Regular,
	Delete12Regular,
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
	Caption2,
	Title3,
	Spinner,
} from '@fluentui/react-components';
import axios from 'axios';
import _, { cloneDeep } from 'lodash';
import { useParams } from 'react-router-dom';
import { GoodEditorDrawer } from './good-editor-drawer';
import { ConfimationDialog } from '../../common/dialogs/confimation-dialog';
import { InventoryMessageBox } from './message-box';
import { InventoryToolbar } from './inventory-toolbar';
import { GoodsNotInSessionDrawer } from './missing-good-product';
import {
	capitalizeFirstLetter,
	convertStringToDate,
	useAppContext,
} from '../../common';
import { usePermissions } from '../../auth/permissions';

const columns = [
	{ columnKey: 'good', label: 'Bien' },
	{ columnKey: 'date', label: 'Date' },
	{ columnKey: 'condition', label: 'Condition' },
	{ columnKey: 'quantity', label: 'Quantité' },
	{ columnKey: 'value', label: 'Valeur' },
	{ columnKey: 'Actions', label: 'Actions' },
];

const tokens = themeToTokensObject(webLightTheme);
const useStyles = makeStyles({
	foreignRow: {
		textDecoration: 'line-through',
		color: tokens.colorNeutralForeground4,
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

	tableCellName: {
		display: 'flex',
		width: '100px',
	},

	main: {
		margin: '4px',
	},
	centerTitle: {
		textAlign: 'center',
	},
	text: {
		color: tokens.colorNeutralForeground4,
	},
	imgContainer: {
		color: tokens.colorNeutralForeground4,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	img: {
		width: '200px',
	},
	actionButtonDelete: {
		backgroundColor: tokens.colorStatusDangerBackground2,
		color: '#000',
		':hover': {
			backgroundColor: tokens.colorStatusDangerBackground1,
		},
		marginLeft: '4px',
	},
	actionButtonAdd: {
		marginLeft: '4px',
	},
	centerIcon: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		textDecoration: 'line-through',
		alignContent: 'center',
		color: tokens.colorNeutralForeground4,	
	},
});

export const InventoryTable = () => {
	const styles = useStyles();
	const [isGoodsNotInSessionDrawerOpen, setIsGoodsNotInSessionDrawerOpen] =
		useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [selectedGood, setSelectedGood] = useState(null);
	const [goodToDelete, setGoodToDelete] = useState(null);
	const [goodNotInSessionToAdd, setgoodNotInSessionToAdd] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const { canDeleteGoods, canUpdateGoods, canUpdateSessions } =
		usePermissions();
	const {
		sessions,
		activeSession,
		currentSession,
		currentGoods,
		stagingGoods,
		setCurrentSession,
		setCurrentGoods,
		setStagingGoods,
	} = useAppContext();

	const { inventoryId: sessionId } = useParams();

	useEffect(() => {
		if (!sessionId) return;

		let shouldQuerySession = false;
		let _currentSession = activeSession || currentSession;

		if (sessionId === 'active') {
			setCurrentSession(activeSession);
		} else {
			const session = sessions.find((session) => session.id === sessionId);
			if (currentSession) {
				setCurrentSession(session);
				_currentSession = session;
			} else {
				shouldQuerySession = true;
			}
		}

		const session$ = shouldQuerySession
			? axios.get(`/api/sessions/${sessionId}`)
			: Promise.resolve(_currentSession);
		const goods$ = axios.get(`/api/sessions/${sessionId}/goods`);

		Promise.all([session$, goods$]).then(([sessionResponse, goodsResponse]) => {
			setCurrentSession(
				shouldQuerySession ? sessionResponse.data : sessionResponse,
			);
			setCurrentGoods(goodsResponse.data.goods || []);
			setStagingGoods(goodsResponse.data.goodsNotInSession || []);
			setIsLoading(false);
		});
	}, [sessionId]);

	const contactTheServerToCreateAChangeInTheCurrentSession = (
		good,
		lastChange,
	) => {
		const change = cloneDeep(lastChange) || {};
		change.sessionId = currentSession.sessionId;

		return axios
			.post(`/api/goods/${good.id}/changes`, change)
			.then(() => {
				moveGoodNotInSessionToGoodsInSession(good, change);
				setgoodNotInSessionToAdd(undefined);
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const moveGoodNotInSessionToGoodsInSession = (good, change) => {
		const changesToAdd = change ? [change] : [];
		setCurrentGoods([
			...currentGoods,
			{ ...good, changes: [...(good.changes || []), ...changesToAdd] },
		]);
		setStagingGoods((stagingGoods || []).filter((g) => g.id !== good.id));
	};

	const handleDeleteGood = () => {
		axios
			.delete(
				`/api/goods/${goodToDelete.id}/changes/${currentSession.sessionId}`,
			)
			.then(function () {
				setGoodToDelete(undefined);
				setCurrentGoods(
					(currentGoods || []).filter((g) => g.id !== goodToDelete.id),
				);
				setStagingGoods(
					(stagingGoods || []).filter((g) => g.id !== goodToDelete.id),
				);
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const onGoodScanned = (goodCode) => {
		const good = stagingGoods.find(({ id }) => id === goodCode);
		if (!good) {
			console.error(
				'Good not found or already in session, cannot add it via scan',
			);
			return;
		}

		setSelectedGood(good);
	};

	if (isLoading) {
		return (
			<div>
				<Spinner></Spinner>
			</div>
		);
	}
	return (
		<div>
			<div className={styles.imgContainer}>
				{!currentSession && (
					<>
						<Title3 className={styles.text}>{'Aucune session active'}</Title3>
						<img
							className={styles.img}
							src="/animation.png"
							alt="Empty State"
						/>
					</>
				)}
			</div>
			{stagingGoods.length > 0 && (
				<InventoryMessageBox
					count={stagingGoods?.length || 0}
					onShowGoods={() => setIsGoodsNotInSessionDrawerOpen(true)}
				/>
			)}
			{currentSession && (
				<InventoryToolbar
					disableButtons={currentSession.active}
					onGoodScanned={onGoodScanned}
					sessionId={currentSession.id || currentSession.id}
				/>
			)}

			{!!currentGoods.length > 0 && (
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
						{currentGoods.map((item) => {
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
											{convertStringToDate(change.time)?.toLocaleDateString()}
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
												desabled={!canUpdateGoods()}
												icon={<Edit12Regular />}
												aria-label="Edit"
												onClick={() => {
													setSelectedGood(item);
													setIsDisabled(false);
												}}
											/>
											<Button
												desabled={!canDeleteGoods()}
												className={styles.actionButtonDelete}
												icon={<Delete12Regular />}
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
			)}
			{currentGoods.length > 0 && (
				<Caption2 className={styles.captionText}>
					{currentGoods.length || 0} biens dans la session /{' '}
					{stagingGoods.length || 0} biens peuvent être ajoutés.
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

			{!!goodNotInSessionToAdd && (
				<ConfimationDialog
					open={!!goodNotInSessionToAdd}
					title={"Ajout d'un bien"}
					content={
						"Vous êtes en train d'ajouter un  bien qui a été créer après la session, êtes-vous sûr de vouloir le faire. Cette action ne peut être faite que par un superviseur"
					}
					risky
					disabled={!canUpdateGoods() || !canUpdateSessions()}
					onClose={(confirmed) =>
						confirmed
							? contactTheServerToCreateAChangeInTheCurrentSession(
									goodNotInSessionToAdd,
									goodNotInSessionToAdd.change,
								)
							: setgoodNotInSessionToAdd(undefined)
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
