import { Input, Field, Button, makeStyles } from '@fluentui/react-components';
import axios from 'axios';
import React, { useMemo, useState } from 'react';
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
		flexDirection: 'column',
        marginBottom: '16px',
	},
});

export function NameRenderer({ userId, defaultFirstName, defaultLastName }) {
	const styles = useStyles();
    const [firstName, setFirstName] = useState(defaultFirstName);
    const [lastName, setLastName] = useState(defaultLastName);
    const areInputsPristine = useMemo(() => {
        return firstName === defaultFirstName && lastName === defaultLastName;
    }, [firstName, lastName]);


	const updateSubmitEmailAddress = (event) => {
		event.preventDefault();
        const form = event.target;
		const firstName = form.firstname?.value;
        const lastName = form.lastname?.value;

		if (!firstName || !userId || !lastName) {
			return;
		}

		axios
			.patch(`/api/users/${userId}`, {firstName, lastName})
			.then(() => {
				console.log('Ok');
			})
			.catch((e) => {
				console.error(e);
			});
	};

	return (
		<form className={styles.emailForm} onSubmit={updateSubmitEmailAddress}>
			<Field label="FirstName" className={styles.emailFormField}>
				<Input
					defaultValue={defaultFirstName || ''}
					type="text"
					id={'text-input'}
					name="firstname"
					className={styles.input}
					onChange={(event) => {
                        setFirstName(event.target.value);
					}}
				/>
			</Field>

            <Field label="LastName" className={styles.emailFormField}>
				<Input
					defaultValue={defaultLastName || ''}
					type="text"
					id={'text-input'}
					name="lastname"
					className={styles.input}
					onChange={(event) => {
                        setLastName(event.target.value)
					}}
				/>
			</Field>
				<Button
					type="submit"
					className={styles.emailFormButton}
                    disabled={areInputsPristine}
				>
                    Enregistrer
                </Button>                
		</form>
	);
}

NameRenderer.propTypes = {
	userId: PropTypes.string.isRequired,
	defaultFirstName: PropTypes.string.isRequired,
	defaultLastName: PropTypes.string.isRequired,
};
