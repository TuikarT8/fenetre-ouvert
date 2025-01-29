import React, { useState, useEffect } from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	makeStyles,
	useRestoreFocusSource,
	TableRow,
	TableCell,
	TableCellLayout,
} from '@fluentui/react-components';
import {
	Add12Filled,
	Dismiss24Regular,
	Edit12Regular,
} from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import { PreviousSessionGoodDeleteConfirmationPopover } from './delete-popOver';
import {
	ConfimationDialog,
	convertStringToDate,
	useAppContext,
} from '../../common';
import { usePermissions } from '../../auth/permissions';
import { useParams } from 'react-router-dom';
import _, { cloneDeep } from 'lodash';
import axios from 'axios';
import { GoodEditorDrawer } from './good-editor-drawer';

function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

const useStyles = makeStyles({
	actionButtonAdd: {
		marginLeft: '4px',
	},
});

export function GoodsNotInSessionDrawer({ open, onClose }) {
	const {
		sessions,
		activeSession,
		currentSession,
		stagingGoods,
		currentGoods,
		setCurrentSession,
		setCurrentGoods,
		setStagingGoods,
	} = useAppContext();

	const styles = useStyles();
	const restoreFocusSourceAttributes = useRestoreFocusSource();
	const [goods, setGoods] = useState([]);
	const { canUpdateGoods, canUpdateSessions } = usePermissions();
	const [goodNotInSessionToAdd, setgoodNotInSessionToAdd] = useState(null);
	const [selectedGood, setSelectedGood] = useState(null)
	const [isDisabled, setIsDisabled] = useState(false);


	useEffect(() => {
		if (stagingGoods) {
			setGoods(stagingGoods);
		}
	}, [JSON.stringify(stagingGoods)]);

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

	return (
		<div className={styles.root}>
			<Drawer
				{...restoreFocusSourceAttributes}
				separator
				size={'medium'}
				position={'end'}
				open={open}
				onOpenChange={(_, { open }) => {
					if (!open) onClose();
				}}>
				<DrawerHeader>
					<DrawerHeaderTitle
						action={
							<Button
								appearance="subtle"
								aria-label="Close"
								icon={<Dismiss24Regular />}
								onClick={() => onClose()}
							/>
						}>
						Missing Goods Product
					</DrawerHeaderTitle>
				</DrawerHeader>

				<DrawerBody>
					{(goods || []).map((item) => {
						const change = _.last(item.changes);
						return (
							<TableRow key={item.id}>
								<TableCell>
									<TableCellLayout>
										{capitalizeFirstLetter(item.name)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={item.id}></TableCellLayout>
								</TableCell>
								<TableCell role="gridcell" tabIndex={0}>
									<TableCellLayout>
										<PreviousSessionGoodDeleteConfirmationPopover item={item} />
										<Button
											desabled={!canUpdateGoods()}
											className={styles.actionButtonAdd}
											icon={<Edit12Regular />}
											aria-label="Edit"
											onClick={() => {
												setSelectedGood(item);
												setIsDisabled(true);
											}}
										/>
										<Button
											icon={<Add12Filled />}
											aria-label="Add"
											className={styles.actionButtonAdd}
											onClick={() => {
												if (change) {
													if (
														convertStringToDate(currentSession.startDate) <
														convertStringToDate(change.time)
													)
														setgoodNotInSessionToAdd(item);
												} else {
													contactTheServerToCreateAChangeInTheCurrentSession(
														item,
														change,
													);
												}
											}}
										/>
									</TableCellLayout>
								</TableCell>
							</TableRow>
						);
					})}
				</DrawerBody>
			</Drawer>

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
		</div>
	);
}

GoodsNotInSessionDrawer.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
