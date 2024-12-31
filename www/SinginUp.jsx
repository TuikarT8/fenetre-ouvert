import { Button, Input, Label, makeStyles } from '@fluentui/react-components';
import axios from 'axios';
import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';

const useStyles = makeStyles({
	container: {
		width: '100%',
		height: '100%',
		position: 'fixed',
		backgroundColor: '#fff',
		top: 0,
		left: 0,
		zIndex: 1000,
		display: 'flex',
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		margin: 'auto',
		width: '200px',
		height: '500px',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
	input: {
		marginBottom: '16px',
	},
});

export function SinginUp() {
	const styles = useStyles();
	const form = useRef(null);

	const handleSubmit = (event) => {
        event.preventDefault();
		const form = event.target;

		const username = form.emailAddress?.value;
		const password = form.password?.value;
        const firstname = form.firstname?.value;
        const middlename = form.middlename?.value;
        const lastname = form.lastname?.value;
		const address = form.address?.value;

		if (!username || !password || !firstname || !middlename || !lastname || !address) {
			return;
		}

		axios
			.post('/api/register', form)
			.then(() => {
				form.current?.reset();
				Navigate('/login');
			})
			.catch(() => {
				console.error("L'inscription n'a pas reussi");
		});
    };

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit} ref={form}>
				<Label required htmlFor={'firstname-name'}>
					FirstName
				</Label>
				<Input
					className={styles.input}
					required
					type="firstname"
					id={'firstname-name'}
					name="firstname"
				/>
				<Label required htmlFor={'middle-name'}>
					MiddleName
				</Label>
				<Input
					className={styles.input}
					required
					type="middle"
					id={'middle-name'}
					name="middlename"
				/>

				<Label required htmlFor={'last-name'}>
					LastName
				</Label>
				<Input
					className={styles.input}
					required
					type="last"
					id={'last-name'}
					name="lastname"
				/>

				<Label required htmlFor={'email-input'}>
					Email
				</Label>
				<Input
					className={styles.input}
					required
					type="email"
					id={'email-input'}
					name="emailAddress"
				/>
				<Label required htmlFor={'password'}>
					Password
				</Label>
				<Input
					className={styles.input}
					required
					type="password"
					id={'password'}
					name="password"
				/>
				<Label required htmlFor={'address'}>
					Address
				</Label>
				<Input
					className={styles.input}
					required
					type="address"
					id={'address'}
					name="address"
				/>
				<Button type="submit" appearance="primary">
					Submit
				</Button>
			</form>
		</div>
	);
}
