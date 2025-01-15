import { Input, Field, Button, makeStyles } from '@fluentui/react-components';
import axios from 'axios';
import React, { useState } from 'react';
import { CheckmarkRegular } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
const useStyles = makeStyles({
	emailFormButton: {
		width: 'fit-content',
		height: 'fit-content',
		top: '16px',
		marginTop: '10px',
		marginLeft: '8px',
		position: 'relative',
	},
	emailFormField: {
		width: 'auto',
		flex: '1 1',
	},
	emailForm: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
	},
});

export function EmailRenderer({ userId, defaultEmail }) {
	const styles = useStyles();
	const [isInputPristine, setIsInputPristine] = useState(false);
	const updateSubmitEmailAddress = (event) => {
		event.preventDefault();
		const form = event.target;
		const email = event.target?.value;

		if (!email && !userId) {
			return;
		}

		axios
			.post(`/api/auth/email/${userId}`, form)
			.then(() => {
				console.log('Ok');
			})
			.catch((e) => {
				console.error(e);
			});
	};

	return (
		<form className={styles.emailForm} onSubmit={updateSubmitEmailAddress}>
			<Field label="Addresse email" className={styles.emailFormField}>
				<Input
					defaultValue={defaultEmail || ''}
					placeHolder="john.doe@example.com"
					type="email"
					id={'email-input'}
					name="email"
					className={styles.input}
					onChange={(event) => {
						if (event.target.value !== defaultEmail) {
							setIsInputPristine(true);
						} else {
							setIsInputPristine(false);
						}
					}}
				/>
			</Field>
			{isInputPristine && (
				<Button
					type="submit"
					className={styles.emailFormButton}
					icon={<CheckmarkRegular />}
				/>
			)}
		</form>
	);
}

EmailRenderer.propTypes = {
	userId: PropTypes.string.isRequired,
	defaultEmail: PropTypes.string,
};
