import React, { useState } from 'react';
import { HistoryFilled, LauncherSettingsRegular } from '@fluentui/react-icons';
import { makeStyles, Toolbar, ToolbarButton } from '@fluentui/react-components';
import { CreateMenuButton } from './create-menu';
import { GoodCreationDialog } from './dialogs/good-creation.dialog';
import { SessionCreationDialog } from './dialogs/session-creation-dialog';
import { Hamburger } from '@fluentui/react-nav-preview';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
	return (
		<div>
			<img src="https://placehold.co/64x64" />
		</div>
	);
};

const useClasses = makeStyles({
	container: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: '64px',
	},
});

export const Navbar = (props) => {
	const [isCreateGoodDialogOpen, setIsCreateGoodDialogOpen] = useState(false);
	const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] =
		useState(false);
	const styles = useClasses();

	const onCreateMenuOptionSelected = (option) => {
		if (option === 'good') {
			setIsCreateGoodDialogOpen(true);
		}
	};
	const navigate = useNavigate();

	const onCreateMenuSessionSelected = (option) => {
		if (option === 'session') {
			setIsCreateSessionDialogOpen(true);
		}
	};

	return (
		<div className={styles.container}>
			<Hamburger onClick={() => props.onToggleAppNavDrawer()} />

			<Logo />
			<span className="flex-expand"></span>
			<Toolbar aria-label="Vertical Button" {...props}>
				<CreateMenuButton
					onMenuSelected={onCreateMenuOptionSelected}
					onSessionMenuSelected={onCreateMenuSessionSelected}
				/>
				<ToolbarButton
					vertical icon={<HistoryFilled />}
					onClick = {()=> {
						navigate('historique');
					}}
				>
					Historique
				</ToolbarButton>
				<ToolbarButton vertical icon={<LauncherSettingsRegular />}>
					Configuration
				</ToolbarButton>

				<GoodCreationDialog
					title="Creer un bien"
					open={isCreateGoodDialogOpen}
					onClose={() => {
						setIsCreateGoodDialogOpen(false);
					}}
				/>
				<SessionCreationDialog
					open={isCreateSessionDialogOpen}
					onClose={() => {
						setIsCreateSessionDialogOpen(false);
					}}
				/>
			</Toolbar>
		</div>
	);
};

Navbar.propTypes = {
	onToggleAppNavDrawer: PropTypes.func.isRequired,
};
