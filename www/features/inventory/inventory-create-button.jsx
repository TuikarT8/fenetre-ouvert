import * as React from 'react';
import {
	Menu,
	MenuTrigger,
	MenuList,
	MenuItem,
	MenuPopover,
	ToolbarButton,
} from '@fluentui/react-components';
import { AddFilled } from '@fluentui/react-icons';
import PropTypes from 'prop-types';

/**
 * Main app menu
 * @param {{onMenuSelected: (value: 'good' | 'session') => void}} props 
 * @param {{onSessionMenuSelected: (value: 'good' | 'session') => void}} props 

 * @returns 
 */
export const CreateButton = (props) => (
	<Menu>
		<MenuTrigger disableButtonEnhancement>
			<ToolbarButton
				vertical
				appearance="primary"
				icon={<AddFilled />}></ToolbarButton>
		</MenuTrigger>

		<MenuPopover>
			<MenuList>
				<MenuItem onClick={() => props?.onMenuSelected?.('good')}>
					Ajouter un bien
				</MenuItem>
			</MenuList>
		</MenuPopover>
	</Menu>
);

CreateButton.propTypes = {
	onMenuSelected: PropTypes.func.isRequired,
	onSessionMenuSelected: PropTypes.func.isRequired,
};
