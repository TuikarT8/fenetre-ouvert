import React from 'react';
import {
	Dialog,
	DialogTrigger,
	DialogSurface,
	DialogTitle,
	DialogBody,
	DialogActions,
	DialogContent,
	Button,
	makeStyles,
	themeToTokensObject,
	webLightTheme,
	mergeClasses,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';

const tokens = themeToTokensObject(webLightTheme);
const useStyles = makeStyles({
	riskyPrimary: {
		backgroundColor: tokens.colorStatusDangerBackground3,
		':hover': {
			backgroundColor: tokens.colorStatusDangerBackground3Hover,
		},
	},
});

export const ConfimationDialog = ({ open, content, title, risky, onClose }) => {
	const styles = useStyles();

	return (
		<Dialog open={open}>
			<DialogSurface>
				<DialogBody>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent>{content}</DialogContent>
					<DialogActions>
						<DialogTrigger disableButtonEnhancement>
							<Button appearance="secondary" onClick={() => onClose?.(false)}>
								Annuler
							</Button>
						</DialogTrigger>
						<Button
							appearance="primary"
							className={mergeClasses(risky ? styles.riskyPrimary : undefined)}
							onClick={() => onClose?.(true)}>
							Confirmer
						</Button>
					</DialogActions>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
};

ConfimationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	content: PropTypes.string.isRequired,
	onDelete: PropTypes.func.isRequired,
	risky: PropTypes.bool,
};
