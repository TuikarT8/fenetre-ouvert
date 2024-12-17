import React, { useRef } from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	Input,
	Field,
	DrawerFooter,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import axios from 'axios';
import { convertStringToDate } from '../../common';

export const SessionDrawer = ({ isOpen, onClose, sessionId, session }) => {
	const form = useRef(null);
	const handleSubmitForm = (_form) => {
		var session = {
			author: _form.author?.value,
			startDate: _form.startDate?.value
				? new Date(_form.startDate?.value)
				: undefined,
			endDate: _form.endDate?.value
				? new Date(_form.endDate?.value)
				: undefined,
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
					Modifier la session
				</DrawerHeaderTitle>
			</DrawerHeader>
			<DrawerBody>
				<form onSubmit={handleSubmitForm} ref={form}>
					<Field label={'Author'} required>
						<Input
							required
							type="string"
							name="author"
							defaultValue={session?.author || 'Non defini'}
						/>
					</Field>

					<Field label={'Start Date'}>
						<Input
							type="date"
							name="startDate"
							defaultValue={
								session?.endDate
									? convertStringToDate(session?.startDate)
									: undefined
							}
						/>
					</Field>

					<Field label={'End Date'}>
						<Input
							type="date"
							name="endDate"
							defaultValue={
								session?.endDate
									? convertStringToDate(session?.endDate)
									: undefined
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
