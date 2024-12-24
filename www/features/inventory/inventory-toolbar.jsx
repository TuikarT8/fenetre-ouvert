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

export const InventoryToolbar = ({ sessionId }) => {
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

	const onGoodScanned = (goodCode) => {
		// 1. Récupérer le bien depuis la base de donnée, dont le code correspond à decodedText

		// 2. Ajouter un changement pour la session active et

		// 3. Afficher la panneau latéral droit pour permettre à l'utilisateur de modifier les valeurs
		// du changement
	}

	return (
		<div>
			<Toolbar aria-label="Vertical Button">
				<GoodScanner onGoodSCanned={onGoodScanned}/>
				<Tooltip content={'Créer un bien'} relationship="description">
					<ToolbarButton
						vertical
						onClick={onCreateMenuOptionSelected}
						icon={<AddFilled />}>
						Ajouter
					</ToolbarButton>
				</Tooltip>

				<Tooltip
					content={"Importer des biens à partir d'un fichier JSON, CSV ou XML"}
					relationship="description">
					<ToolbarButton
						vertical
						onClick={handleFileUploadClick}
						icon={<ArrowUploadFilled />}>
						Importer
					</ToolbarButton>
				</Tooltip>

				<Tooltip content={'Clôturer cette session'} relationship="description">
					<ToolbarButton
						vertical
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
};
