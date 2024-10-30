import React from 'react';
import {
    AddFilled,
  FontDecreaseRegular,
  HistoryFilled,
  LauncherSettingsRegular,
  TextFontRegular,
} from "@fluentui/react-icons";
import { makeStyles, Toolbar, ToolbarButton } from "@fluentui/react-components";
import { CreateMenuButton } from './button';


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
    const styles = useClasses();

    return (
        <div className={styles.container}>
            <Logo/>
            <span className="flex-expand"></span>
            <Toolbar aria-label="Vertical Button" {...props}>
            <CreateMenuButton/> 
            <ToolbarButton vertical icon={<HistoryFilled />}>
                Historique
            </ToolbarButton>
            <ToolbarButton vertical icon={<LauncherSettingsRegular />}>
                Configuration
            </ToolbarButton>
               
            </Toolbar>
        </div>
    );
}