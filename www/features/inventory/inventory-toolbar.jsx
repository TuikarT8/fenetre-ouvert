import React, { useRef, useState } from 'react';
import { Toolbar, ToolbarButton, Tooltip } from '@fluentui/react-components';
import { GoodCreationDialog } from '../../common/dialogs/good-creation.dialog';
import {
	AddFilled,
	ArrowUploadFilled,
	LockClosedFilled,
} from '@fluentui/react-icons';
import { useFileUploader } from './use-file-uploader';
import { ConfimationDialog } from '../../common';
import axios from 'axios';
import PropTypes from 'prop-types';
import { GoodScanner } from '../../common/qr-scanner';

export const InventoryToolbar = ({
	disabledButton,
	sessionId,
	onGoodScanned,
}) => {
	const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);
	const fileInputRef = useRef(null);
	const { onFileUpload } = useFileUploader();
	const [desabledSession, setDesabledSession] = useState(false);

	function handleFileUploadClick() {
		fileInputRef.current?.click();
	}

	const desableCurrentSession = () => {
		axios
			.post(`/api/sessions/${sessionId}/close`)
			.then(function () {})
			.catch((e) => {
				console.error(e);
			});
	};

	const onDesabledCurrentSession = () => {
		setDesabledSession(true);
	};

	const onCreateMenuOptionSelected = () => {
		setIsCreateGoodDialogOpen(true);
	};

	return (
		<div>
			<Toolbar aria-label="Vertical Button">
				<GoodScanner disabled={disabledButton} onGoodScanned={onGoodScanned} />
				<Tooltip
					content={
						!disabledButton
							? 'Créer un bien'
							: 'Vous ne pouvez pas créer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						onClick={onCreateMenuOptionSelected}
						disabled={disabledButton}
						icon={<AddFilled />}>
						Ajouter
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={
						!disabledButton
							? "Importer des biens à partir d'un fichier JSON, CSV ou XML"
							: 'Vous ne pouvez pas importer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						disabled={disabledButton}
						onClick={handleFileUploadClick}
						icon={<ArrowUploadFilled />}>
						Importer
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={
						!disabledButton
							? 'Clôturer cette session'
							: 'Vous ne pouvez pas cloturer une session tant que la session est inactive'
					}
					relationship="description">
					<ToolbarButton
						vertical
						disabled={disabledButton}
						onClick={onDesabledCurrentSession}
						icon={<LockClosedFilled />}>
						Clôturer
					</ToolbarButton>
				</Tooltip>
			</Toolbar>

			{!!desabledSession && (
				<ConfimationDialog
					open={!!desabledSession}
					title={'Desactive la session'}
					content={'voulez vous clôturer cette session.'}
					risky
					onClose={() => {
						desableCurrentSession();
						setDesabledSession(false);
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
	disabledButton: PropTypes.bool.isRequired,
};
