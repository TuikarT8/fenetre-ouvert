import React, { useEffect, useRef, useState } from 'react';
import { Toolbar, ToolbarButton, Tooltip } from '@fluentui/react-components';
import { GoodCreationDialog } from '../../common/dialogs/good-creation.dialog';
import { AddFilled, ArrowUploadFilled } from '@fluentui/react-icons';

export const InventoryToolbar = () => {
	const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);
	const fileInputRef = useRef(null);

	function handleFileUploadClick() {
		fileInputRef.current?.click();
	}

	const onCreateMenuOptionSelected = () => {
		setIsCreateGoodDialogOpen(true);
	};

	return (
		<div>
			<Toolbar aria-label="Vertical Button">
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
			</Toolbar>
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
				style={{ visibility: 'invisible', width: 0, height: 0 }}></input>
		</div>
	);
};
