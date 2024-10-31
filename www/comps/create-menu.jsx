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

export const CreateMenuButton = (props) => (
  <Menu>
    <MenuTrigger disableButtonEnhancement>
      <ToolbarButton vertical appearance="primary" icon={<AddFilled />}>
        Créer
      </ToolbarButton>
    </MenuTrigger>

    <MenuPopover>
      <MenuList>
        <MenuItem onClick={() => props?.onMenuSelected?.('good')}>Bien</MenuItem>
        <MenuItem>Session inventoriage</MenuItem>
      </MenuList>
    </MenuPopover>
  </Menu>
);