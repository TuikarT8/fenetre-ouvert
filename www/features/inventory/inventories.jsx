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
	makeStyles,
	themeToTokensObject,
	webLightTheme,
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

const columns = [
	{ columnKey: 'author', label: 'Author' },
	{ columnKey: 'startDate', label: 'Start Date' },
	{ columnKey: 'closeDate', label: 'Close Date' },
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

export const InventoriesTable = () => {
	const { setSessions, sessions } = useInventory();
	const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
	const focusableGroupAttr = useFocusableGroup({
		tabBehavior: 'limited-trap-focus',
	});
	const [isCreateSessionDialogOpen, setCreateSessionDialogOpen] =
		useState(false);
	const [hasActiveSession, setHasActiveSession] = useState(false);
	const [sessionToDelete, setSessionToDelete] = useState(undefined);
	const [sessionId, setIdSession] = useState(null)
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

	const handleDeleteSession =()=>  {
		axios
			.delete(`/api/sessions/${sessionId}`)
			.then(() => {
				setSessionToDelete(undefined)
			})
			.catch((e) => {
				console.error(e);
			});
		}

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
							<TableRow key={item.id}>
								<TableCell>
									<TableCellLayout key={item.id}>
										{capitalizeFirstLetter(item.author || 'inconnu')}
									</TableCellLayout>
								</TableCell>

								<TableCell>
									<TableCellLayout>
										{convertStringToDate(item.startDate)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout>
										{!item.closeDate?.includes('0001')
											? convertStringToDate(item.closeDate)
											: 'Non clôturé'}
									</TableCellLayout>
								</TableCell>
								<TableCell role="gridcell" tabIndex={0} {...focusableGroupAttr}>
									<TableCellLayout>
										<Button icon={<EditRegular />} aria-label="Edit" />

										<Tooltip
											content="Vous ne pouviez pas supprimer une session active"
											relationship="label">
											<Button
												icon={<DeleteRegular />}
												aria-label="Delete"
												disabled={item.active}
												onClick= {()=> {
													setSessionToDelete(true)
													setIdSession(item.id)
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

			{!!sessionToDelete && (
				<ConfimationDialog
					open={!!sessionToDelete}
					title={'Suppression de session'}
					content={
						"Voulez-vous vraiment supprimer la session ?"
					}
					risky
					onClose={(confirmed) =>
						confirmed ? handleDeleteSession() : setSessionToDelete(undefined)
					}
				/>
			)}
		</div>
	);
};
