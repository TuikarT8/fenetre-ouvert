import React, { useEffect, useState } from 'react';
import {
	AddFilled,
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
	Tooltip,
	ToolbarButton,
	Toolbar,
	makeStyles,
	tokens,
	Avatar,
	Text,
} from '@fluentui/react-components';
import axios from 'axios';
import {
	capitalizeFirstLetter,
	ConfimationDialog,
	convertStringToDate,
	SessionCreationDialog,
	useAppContext,
} from '../../common';
import { useInventory } from '../../provider';
import { SessionDrawer } from './session-editor-drawer';
import { Link, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../auth/permissions';

const columns = [
	{ columnKey: 'author', label: 'Auteur' },
	{ columnKey: 'startDate', label: 'Date début' },
	{ columnKey: 'closeDate', label: 'Date clôture' },
];

const useStyles = makeStyles({
	actionButtonUpdate: {
		margin: '4px',
	},
	actionButtonDelete: {
		color: tokens.colorStatusDangerForeground1,
	},
	marginSpace: {
		margin: '4px',
	}
});

export const InventoriesTable = () => {
	const { setSessions, sessions } = useInventory();
	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const navigate = useNavigate();
	const [isCreateSessionDialogOpen, setCreateSessionDialogOpen] =
		useState(false);
	const [selectedSession, setSelectedSession] = useState();
	const [action, setAction] = useState('');
	const styles = useStyles();
	const { canCreateSessions, canDeleteSessions, canUpdateSessions } =
		usePermissions();

	useEffect(() => {
		axios
			.get(`/api/sessions`)
			.then(({ data }) => {
				setSessions(data);
				setHasActiveSession(!!data?.find((elem) => elem.active));
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

	const handleDeleteSession = () => {
		if (!selectedSession) return;

		axios
			.delete(`/api/sessions/${selectedSession.id}`)
			.then(() => {
				setSelectedSession();
			})
			.catch((e) => {
				setSelectedSession();
				console.error(e);
			});
	};

	return (
		<div>
			<Toolbar aria-label="Vertical Button">
				<Tooltip
					content={
						!canCreateSessions()
							? "Vous ne pouvez pas créer de session car vous n'avez pas les autoririsation requises"
							: 'Créer une session'
					}
					relationship="description">
					<ToolbarButton
						disabled={!canCreateSessions()}
						vertical
						onClick={() => {
							setCreateSessionDialogOpen(true);
						}}
						icon={<AddFilled />}>
						Créer
					</ToolbarButton>
				</Tooltip>
			</Toolbar>
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
					{(sessions || []).map((item) => {
						return (
							<TableRow
								key={item.id}
								onClick={() => navigate(`/inventories/${item?.id}`)}>
								<TableCell>
									<TableCellLayout
										key={item.id}
										>
										<Avatar  name={item?.author?.name || 'Inconnu'} />
										{item.author?.name && <Link className={styles.marginSpace} to= {`/users/${item.id}`}>{capitalizeFirstLetter(item?.author?.name || 'inconnu')}</Link>}
										{!item.author?.name && <Text className={styles.marginSpace}>{"Auteur Inconnu"}</Text>}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout>
										{convertStringToDate(item.startDate)?.toDateString()}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout>
										{!item.closeDate?.includes('0001')
											? convertStringToDate(item.closeDate)?.toDateString()
											: 'Non clôturé'}
									</TableCellLayout>
								</TableCell>
								<TableCell role="gridcell" tabIndex={0} {...focusableGroupAttr}>
									<TableCellLayout>
										<Tooltip content="Modifier la session" relationship="label">
											<Button
												disabled={!canUpdateSessions()}
												icon={<Edit12Regular />}
												aria-label="Edit"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setSelectedSession(item);
													setAction('edit');
												}}
												className={styles.actionButtonUpdate}
											/>
										</Tooltip>

										<Tooltip
											content={
												item.active
													? 'Vous ne pouvez pas supprimer une session active'
													: 'Supprimer la session'
											}
											relationship="label">
											<Button
												className={styles.actionButtonDelete}
												icon={<Delete12Regular />}
												aria-label="Delete"
												disabled={!canDeleteSessions()}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													setSelectedSession(item);
													setAction('delete');
												}}
											/>
										</Tooltip>
									</TableCellLayout>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>

			<SessionCreationDialog
				open={isCreateSessionDialogOpen}
				onClose={() => {
					setCreateSessionDialogOpen(false);
				}}
			/>

			{!!selectedSession && action === 'delete' && (
				<ConfimationDialog
					open={!!selectedSession}
					title={'Suppression de session'}
					content={'Voulez-vous vraiment supprimer la session ?'}
					risky
					onClose={(confirmed) =>
						confirmed ? handleDeleteSession() : setSelectedSession()
					}
				/>
			)}

			{!!selectedSession && action === 'edit' && (
				<SessionDrawer
					isOpen={!!selectedSession}
					sessionId={selectedSession?.id}
					onClose={() => {
						setSelectedSession();
					}}
					session={selectedSession}
				/>
			)}
		</div>
	);
};
