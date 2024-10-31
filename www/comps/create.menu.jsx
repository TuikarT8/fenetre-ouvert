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
import PropTypes from 'prop-types';

/**
 * Main app menu
 * @param {{onMenuSelected: (value: 'good' | 'session') => void}} props 
 * @returns 
 */
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

CreateMenuButton.propTypes = {
  onMenuSelected: PropTypes.func.isRequired,
}