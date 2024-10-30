import React from 'react';
import {
    AddFilled,
  FontDecreaseRegular,
  TextFontRegular,
} from "@fluentui/react-icons";
import { makeStyles, Toolbar, ToolbarButton } from "@fluentui/react-components";


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
                <ToolbarButton vertical appearance="primary" icon={<AddFilled />}>
                Nouveau
                </ToolbarButton>
                <ToolbarButton vertical icon={<FontDecreaseRegular />}>
                Historique
                </ToolbarButton>
                <ToolbarButton vertical icon={<TextFontRegular />}>
                Configuration
                </ToolbarButton>
            </Toolbar>
        </div>
    );
}