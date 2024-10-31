import React, { useState } from 'react';
import {
  HistoryFilled,
  LauncherSettingsRegular,
} from "@fluentui/react-icons";
import { makeStyles, Toolbar, ToolbarButton } from "@fluentui/react-components";
import { CreateMenuButton } from './create.menu';
import { GoodCreationDialog } from './good-creation.dialog';

const Logo = () => {
    return (
        <div>
            <img src="https://placehold.co/64x64"/>
        </div>
    );
}

const useClasses = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'row',
    }
})

export const Navbar = (props) => {
    const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);
    const styles = useClasses();
    
    const onCreateMenuOptionSelected = (option) => {
        if (option === 'good') {
            setIsCreateGoodDialogOpen(true);
            console.log('Opening the good dialog');
        }
    }

    return (
        <div className={styles.container}>
            <Logo/>
            <span className="flex-expand"></span>
            <Toolbar aria-label="Vertical Button" {...props}>
                <CreateMenuButton onMenuSelected={onCreateMenuOptionSelected}/> 
                <ToolbarButton vertical icon={<HistoryFilled/>}>
                    Historique
                </ToolbarButton>
                <ToolbarButton vertical icon={<LauncherSettingsRegular/>}>
                    Configuration
                </ToolbarButton>

                <GoodCreationDialog open={isCreateGoodDialogOpen} onClose={() => {setIsCreateGoodDialogOpen(false)}
            }/>
            </Toolbar>
        </div>
    );
}