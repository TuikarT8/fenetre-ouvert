import React, { useEffect, useState } from 'react';
import { EditRegular, DeleteRegular, AddFilled } from '@fluentui/react-icons';
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
} from '@fluentui/react-components';
import axios from 'axios';
import {
	capitalizeFirstLetter,
	ConfimationDialog,
	convertStringToDate,
	SessionCreationDialog,
} from '../../common';
import { useInventory } from '../../provider';
import { SessionDrawer } from './session-editor-drawer';
import { useNavigate } from 'react-router-dom';

const columns = [
	{ columnKey: 'author', label: 'Author' },
	{ columnKey: 'startDate', label: 'Start Date' },
	{ columnKey: 'closeDate', label: 'Close Date' },
];

export const InventoriesTable = () => {
	const { setSessions, sessions } = useInventory();
	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const navigate = useNavigate()
	const [isCreateSessionDialogOpen, setCreateSessionDialogOpen] =
		useState(false);
	const [hasActiveSession, setHasActiveSession] = useState(false);
	const [selectedSession, setSelectedSession] = useState();
	const [action, setAction] = useState('');

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
						hasActiveSession
							? "Vous ne pouvez pas créer une session tant qu'il y'a une session active"
							: 'Créer une session'
					}
					relationship="description">
					<ToolbarButton
						disabled={hasActiveSession}
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
							<TableRow key={item.id} onClick={() => navigate(`/inventories/${item?.id}`)}>
								<TableCell>
									<TableCellLayout key={item.id}>
										{capitalizeFirstLetter(item.author || 'inconnu')}
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
												icon={<EditRegular />}
												aria-label="Edit"
												onClick={() => {
													setSelectedSession(item);
													setAction('edit');
												}}
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
												icon={<DeleteRegular />}
												aria-label="Delete"
												disabled={item.active}
												onClick={() => {
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
