import React, { useRef, useState } from 'react';
import { Toolbar, ToolbarButton, Tooltip } from '@fluentui/react-components';
import { GoodCreationDialog } from '../../common/dialogs/good-creation.dialog';
import {
	AddFilled,
	ArrowUploadFilled,
	FolderOpenRegular,
	LockClosedFilled,
} from '@fluentui/react-icons';
import { useFileUploader } from './use-file-uploader';
import { ConfimationDialog, useAppContext } from '../../common';
import axios from 'axios';
import PropTypes from 'prop-types';
import { GoodScanner } from '../../common/qr-scanner';
import { usePermissions } from '../../auth/permissions';

export const InventoryToolbar = ({ sessionId, onGoodScanned }) => {
	const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);
	const fileInputRef = useRef(null);
	const { onFileUpload } = useFileUploader();
	const { canUpdateSessions } = usePermissions();
	const [isDisablingSession, setIsDisablingSession] = useState(false);
	const { currentSession, setCurrentSession } = useAppContext();
	const [isSessionDisabled, setIsSessionDisabled] = useState(!currentSession?.active);
	function handleFileUploadClick() {
		fileInputRef.current?.click();
	}

	const onSessionDisabled = (disabled) => {
		setCurrentSession({ ...currentSession, active: !disabled });
		setIsSessionDisabled(disabled);
		setIsDisablingSession(false);
	};

	const disableCurrentSession = () => {
		axios
			.post(`/api/sessions/${sessionId}/close`)
			.then(function () {
				onSessionDisabled(true);
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const activateCurrentSession = () => {
		if (!sessionId) {
			return;
		}

		axios
			.patch(`/api/sessions/${sessionId}/activate`)
			.then(function () {
				onSessionDisabled(false);
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const onCreateMenuOptionSelected = () => {
		setIsCreateGoodDialogOpen(true);
	};

	const onDisableSession = () => {
		setIsDisablingSession(true);
	};

	return (
		<div>

			<Toolbar aria-label="Vertical Button">
				<GoodScanner
					disabled={isSessionDisabled}
					onGoodScanned={onGoodScanned}
				/>
				<Tooltip
					content={
						!isSessionDisabled
							? 'Créer un bien'
							: 'Vous ne pouvez pas créer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						onClick={onCreateMenuOptionSelected}
						disabled={isSessionDisabled}
						icon={<AddFilled />}>
						Ajouter
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={
						!isSessionDisabled
							? "Importer des biens à partir d'un fichier JSON, CSV ou XML"
							: 'Vous ne pouvez pas importer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						disabled={isSessionDisabled}
						onClick={handleFileUploadClick}
						icon={<ArrowUploadFilled />}>
						Importer
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={
						!isSessionDisabled
							? 'Clôturer cette session'
							: 'Vous ne pouvez pas cloturer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						disabled={isSessionDisabled}
						onClick={onDisableSession}
						icon={<LockClosedFilled />}>
						Clôturer
					</ToolbarButton>
				</Tooltip>
				<Tooltip
					content={
						!canUpdateSessions()
							? "Vous n'êtes pas autorisé à modifier un bien dans cette session "
							: 'Vous êtes autorisé à modifier un bien dans cette session '
					}>
					<ToolbarButton
						vertical
						disabled={!canUpdateSessions() || !isSessionDisabled}
						onClick={() => {
							activateCurrentSession();
						}}
						icon={<FolderOpenRegular />}>
						Activer
					</ToolbarButton>
				</Tooltip>
			</Toolbar>

			{isDisablingSession && (
				<ConfimationDialog
					open={isDisablingSession}
					title={'Desactive la session'}
					content={'voulez vous clôturer cette session.'}
					risky
					onClose={(confirmed) => {
						if (confirmed) {
							disableCurrentSession();
							return
						}

						setIsDisablingSession(false);
					}}
				/>
			)}

			<GoodCreationDialog
				title="Ajouter un bien"
				open={isCreateGoodDialogOpen}
				onClose={() => {
					setIsCreateGoodDialogOpen(false);
				}}
			/>
			<input
				ref={fileInputRef}
				type="file"
				accept=".json,.csv,.xml"
				style={{ visibility: 'invisible', width: 0, height: 0 }}
				onChange={onFileUpload}
			/>
		</div>
	);
};

InventoryToolbar.propTypes = {
	sessionId: PropTypes.string.isRequired,
	onGoodScanned: PropTypes.func.isRequired,
};
