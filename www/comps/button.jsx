import * as React from "react";

import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  ToolbarButton,
} from "@fluentui/react-components";
import { AddFilled } from "@fluentui/react-icons";

export const CreateMenuButton = () => (
  <Menu>
    <MenuTrigger disableButtonEnhancement>
      <ToolbarButton vertical appearance="primary" icon={<AddFilled />}>
        Créer
      </ToolbarButton>
    </MenuTrigger>

    <MenuPopover>
      <MenuList>
        <MenuItem>Faire un inventaire </MenuItem>
        <MenuItem>Creer Un bien</MenuItem>
      </MenuList>
    </MenuPopover>
  </Menu>
);