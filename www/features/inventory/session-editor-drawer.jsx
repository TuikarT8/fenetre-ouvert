import React, { useRef } from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	Field,
	DrawerFooter,
	Avatar,
	makeStyles,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import axios from 'axios';
import { convertStringToDate, isZeroDate } from '../../common';
import { DatePicker } from '@fluentui/react-datepicker-compat';

const useStyles = makeStyles({
	main: {
		display: 'flex',
		flexDirection: 'row',
	},
	avatarName: {
		margin: '4px',
	},
});

export const SessionDrawer = ({ isOpen, onClose, sessionId, session }) => {
	const form = useRef(null);
	const styles = useStyles();
	const handleSubmitForm = (_form) => {
		var session = {
			startDate: isZeroDate(_form.startDate?.value)
				? undefined
				: new Date(_form.startDate?.value),
			endDate: isZeroDate(_form.endDate?.value)
				? undefined
				: new Date(_form.endDate?.value),
		};

		axios
			.patch(`/api/sessions/${sessionId}/session`, session)
			.then(function () {})
			.catch((e) => {
				console.error(e);
			});
	};

	return (
		<Drawer
			open={isOpen}
			position="end"
			size="medium"
			onOpenChange={(_, { open }) => {
				if (!open) onClose();
			}}>
			<DrawerHeader>
				<DrawerHeaderTitle
					action={
						<Button
							appearance="subtle"
							aria-label="Close"
							icon={<Dismiss24Regular />}
							onClick={() => onClose()}
						/>
					}>
					{' Session du ' + convertStringToDate(session.startDate)}
				</DrawerHeaderTitle>
				<div className={styles.main}>
					<Avatar name={session?.name?.author || 'Auteur Inconnu'} />
					<div className={styles.avatarName}>
						{session?.author?.name || 'Auteur inconnu'}
					</div>
				</div>
			</DrawerHeader>
			<DrawerBody>
				<form onSubmit={handleSubmitForm} ref={form}>
					<Field label={'Start Date'}>
						<DatePicker
							name="startDate"
							placeholder="Select a date..."
							value={
								isZeroDate(session.startDate)
									? undefined
									: convertStringToDate(session.startDate)
							}
						/>
					</Field>

					<Field label={'End Date'}>
						<DatePicker
							name="EndDate"
							placeholder="Select a date..."
							value={
								isZeroDate(session.endDate)
									? undefined
									: convertStringToDate(session.endDate)
							}
						/>
					</Field>
				</form>
			</DrawerBody>
			<DrawerFooter>
				<Button appearance="secondary" onClick={() => onClose?.()}>
					Annuler
				</Button>
				<Button
					appearance="primary"
					onClick={() => {
						handleSubmitForm(form.current);
						onClose?.();
					}}>
					Enregistrer
				</Button>
			</DrawerFooter>
		</Drawer>
	);
};

SessionDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	sessionId: PropTypes.string,
	session: PropTypes.object,
};
