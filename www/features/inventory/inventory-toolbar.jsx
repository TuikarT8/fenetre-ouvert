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
import { ConfimationDialog } from '../../common';
import axios from 'axios';
import PropTypes from 'prop-types';
import { GoodScanner } from '../../common/qr-scanner';
import { usePermissions } from '../../auth/permissions';

export const InventoryToolbar = ({
	disableButtons,
	sessionId,
	onGoodScanned,
	onSessionDisabled,
}) => {
	const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);
	const fileInputRef = useRef(null);
	const { onFileUpload } = useFileUploader();
	const [isSessionDisabled, setIsSessionDisabled] = useState(false);
	const { canUpdateSessions } = usePermissions();
	function handleFileUploadClick() {
		fileInputRef.current?.click();
	}

	const disableCurrentSession = () => {
		axios
			.post(`/api/sessions/${sessionId}/close`)
			.then(function () {})
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
				onSessionDisabled();
			})
			.catch((e) => {
				console.error(e);
			});
	};

	const onDisabledCurrentSession = () => {
		setIsSessionDisabled(true);
	};

	const onCreateMenuOptionSelected = () => {
		setIsCreateGoodDialogOpen(true);
	};

	return (
		<div>
			<Toolbar aria-label="Vertical Button">
				<GoodScanner disabled={disableButtons} onGoodScanned={onGoodScanned} />
				<Tooltip
					content={
						!disableButtons
							? 'Créer un bien'
							: 'Vous ne pouvez pas créer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						onClick={onCreateMenuOptionSelected}
						disabled={disableButtons}
						icon={<AddFilled />}>
						Ajouter
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={
						!disableButtons
							? "Importer des biens à partir d'un fichier JSON, CSV ou XML"
							: 'Vous ne pouvez pas importer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						disabled={disableButtons}
						onClick={handleFileUploadClick}
						icon={<ArrowUploadFilled />}>
						Importer
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={
						!disableButtons
							? 'Clôturer cette session'
							: 'Vous ne pouvez pas cloturer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						disabled={disableButtons}
						onClick={onDisabledCurrentSession}
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
						disabled={!canUpdateSessions()}
						onClick={() => {
							activateCurrentSession();
						}}
						icon={<FolderOpenRegular />}>
						Activer
					</ToolbarButton>
				</Tooltip>
			</Toolbar>

			{!!isSessionDisabled && (
				<ConfimationDialog
					open={!!isSessionDisabled}
					title={'Desactive la session'}
					content={'voulez vous clôturer cette session.'}
					risky
					onClose={() => {
						disableCurrentSession();
						setIsSessionDisabled(false);
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
	disableButtons: PropTypes.bool.isRequired,
	onSessionDisabled: PropTypes.func.isRequired,
};
