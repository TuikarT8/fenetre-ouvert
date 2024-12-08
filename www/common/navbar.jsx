import React, { useState } from 'react';
import { HistoryFilled, LauncherSettingsRegular } from '@fluentui/react-icons';
import { makeStyles, Toolbar, ToolbarButton } from '@fluentui/react-components';
import { CreateMenuButton } from './create-menu';
import { GoodCreationDialog } from './dialogs/good-creation.dialog';
import { SessionCreationDialog } from './dialogs/session-creation-dialog';

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

	const onCreateMenuSessionSelected = (option) => {
		if (option === 'session') {
			setIsCreateSessionDialogOpen(true);
		}
	};

	return (
		<div className={styles.container}>
			<Logo />
			<span className="flex-expand"></span>
			<Toolbar aria-label="Vertical Button" {...props}>
				<CreateMenuButton
					onMenuSelected={onCreateMenuOptionSelected}
					onSessionMenuSelected={onCreateMenuSessionSelected}
				/>
				<ToolbarButton vertical icon={<HistoryFilled />}>
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
