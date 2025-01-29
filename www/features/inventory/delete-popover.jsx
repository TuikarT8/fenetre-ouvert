import React, { useState } from 'react';
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
import { ConfimationDialog, useAppContext } from '../../common';
import { usePermissions } from '../../auth/permissions';

const useStyles = makeStyles({
	actionButtonDelete: {
		backgroundColor: tokens.colorStatusDangerBackground2,
		color: '#000',
		':hover': {
			backgroundColor: tokens.colorStatusDangerBackground1,
		},
		marginLeft: '4px',
	},
});

export function PreviousSessionGoodDeleteConfirmationPopover({item}) {
	const styles = useStyles();
	const [goodToDelete, setGoodToDelete] = useState(null);
	const {
		currentSession,
		stagingGoods,
		currentGoods,
		setCurrentGoods,
		setStagingGoods,
	} = useAppContext();

	const handleDeleteGood = () => {
		axios
			.delete(
				`/api/goods/${goodToDelete.id}/changes/${currentSession.sessionId}`,
			)
			.then(function () {
				setGoodToDelete(undefined);
				setCurrentGoods(
					(currentGoods || []).filter((g) => g.id !== goodToDelete.id),
				);
				setStagingGoods(
					(stagingGoods || []).filter((g) => g.id !== goodToDelete.id),
				);
			})
			.catch((e) => {
				console.error(e);
			});
	};
	return (
		<Popover withArrow>
			<PopoverTrigger disableButtonEnhancement>
				<Button
					className={styles.actionButtonDelete}
					icon={<Delete12Regular />}
					aria-label="Delete"
				/>
			</PopoverTrigger>

			<PopoverSurface tabIndex={-1}>
				<Content open={goodToDelete} content={'Voulez-vous vraiment supprimer le bien '+' '} onClose={(confirmed)=> {
					confirmed ? handleDeleteGood() : setGoodToDelete(undefined)
				}} />
			</PopoverSurface>
		</Popover>
	);
}

function Content({ open, content, onClose }) {
	console.log("This is the state open", open)
	return (
		<div style={{display:!open?'block':'none'}}>
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

PreviousSessionGoodDeleteConfirmationPopover.propTypes = {
	item: PropTypes.object.isRequired,
};