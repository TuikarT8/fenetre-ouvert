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
	Label,
	Input,
	Field,
} from '@fluentui/react-components';
import axios from 'axios';
import PropTypes from 'prop-types';
import { DatePicker } from '@fluentui/react-datepicker-compat';

const useStyles = makeStyles({
	content: {
		display: 'flex',
		flexDirection: 'column',
		rowGap: '10px',
	},
});

/**
 * Dialog for creating goods
 * @param {{onClose: () => void; open: boolean}} props
 * @returns
 */
export const SessionCreationDialog = (props) => {
	const styles = useStyles();

	const handleSubmitSessionForm = (event) => {
		event.preventDefault();
		console.log(event.target);
		var session = {
			startDate: new Date(event.target.date.value),
			description: event.target.description.value,
		};

		axios
			.post('/api/sessions', session)
			.then(function (response) {
				console.log(response.state);
				console.log(response.data);
				props.onClose?.();
			})
			.catch((e) => {
				console.error(e);
			});
	};

	return (
		<Dialog open={props.open}>
			<DialogSurface>
				<form onSubmit={handleSubmitSessionForm}>
					<DialogBody>
						<DialogTitle>Créer une session </DialogTitle>
						<DialogContent className={styles.content}>
							<Field required label="Date de début">
								<DatePicker
									name="date"
									id="date"
									as="input"
									placeholder="Choississez une date..."
								/>
							</Field>
							<Label htmlFor={'description'}>Description</Label>
							<Field>
								<Input type="text" name="description" id={'description'} />
							</Field>
						</DialogContent>
						<DialogActions>
							<DialogTrigger disableButtonEnhancement>
								<Button
									appearance="secondary"
									onClick={() => props?.onClose?.()}>
									Close
								</Button>
							</DialogTrigger>
							<Button type="submit" appearance="primary">
								Submit
							</Button>
						</DialogActions>
					</DialogBody>
				</form>
			</DialogSurface>
		</Dialog>
	);
};

SessionCreationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
