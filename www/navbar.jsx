import React from 'react';
import {
    AddFilled,
  FontDecreaseRegular,
  TextFontRegular,
} from "@fluentui/react-icons";
import { Toolbar, ToolbarButton } from "@fluentui/react-components";


const Logo = () => {
    return (
        <div>
        </div>
    );
}

export const Navbar = (props) => (
    <div>
        <Logo/>
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
)