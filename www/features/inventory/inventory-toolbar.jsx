import React, { useState } from 'react';
import { Toolbar, ToolbarButton, Tooltip } from '@fluentui/react-components';
import { GoodCreationDialog } from '../../common/good-creation.dialog';
import { AddFilled } from '@fluentui/react-icons';

export const InventoryToolbar = () => {
    const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);

    const onCreateMenuOptionSelected = () => {
        setIsCreateGoodDialogOpen(true);
	};
    
    return (
        <div>
            <Toolbar aria-label="Vertical Button" >
                <Tooltip content={'Créer un bien'} relationship='description'>
                    <ToolbarButton vertical onClick={onCreateMenuOptionSelected} icon={<AddFilled />}/>
                </Tooltip>
                <GoodCreationDialog
                    title='Ajouter un bien'
                    open={isCreateGoodDialogOpen}
                    onClose={() => {
                    setIsCreateGoodDialogOpen(false);
                }}
                />
            </Toolbar>
        </div>
    
    )
}
