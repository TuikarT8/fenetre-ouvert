import React from 'react';
import { Delete12Regular } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import {
	Button,
	makeStyles,
	Popover,
	PopoverSurface,
	PopoverTrigger,
	Title3,
	tokens,
} from '@fluentui/react-components';

const useStyles = makeStyles({
	actionButtonDelete: {
			backgroundColor: tokens.colorStatusDangerBackground2,
			color: '#000',
			':hover': {
				backgroundColor: tokens.colorStatusDangerBackground1,
			},
			marginLeft: '4px',
		},
	}
)

export function PreviousSessionGoodDeleteConfirmationPopover() {
   const styles = useStyles()
	return (
		<Popover withArrow>
			<PopoverTrigger disableButtonEnhancement>
				<Button className={styles.actionButtonDelete} icon={<Delete12Regular />} aria-label="Delete" />
			</PopoverTrigger>

			<PopoverSurface tabIndex={-1}>
				<Content content={'Voulez-vous vraiment supprimer le bien'} />
			</PopoverSurface>
		</Popover>
	);
}

function Content({ content, onClose }) {
	return (
		<div>
			<Title3>{content}</Title3>
			<Button appearance="secondary" onClick={() => onClose?.(false)}>
				Annuler
			</Button>
			<Button appearance="primary" onClick={() => onClose?.(true)}>
				Confirmer
			</Button>
		</div>
	);
}

Content.propTypes = {
	open: PropTypes.string.isRequired,
	content: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
};
