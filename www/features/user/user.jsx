import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
	Button,
	Field,
	Input,
	Label,
	makeStyles,
	Spinner,
} from '@fluentui/react-components';
import { useParams } from 'react-router-dom';
import { EmailRenderer } from './email-renderer';

const useStyles = makeStyles({
	container: {
		height: '100%',
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
	},
	emailForm: {
		display: 'flex',
		flexDirection: 'row',
	},
	inputForm: {
		display: 'flex',
	},
	input: {
		marginBottom: '16px',
	},
	button: {
		width: '10px',
		height: '20px',
	},
	spinner: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		margin: 'auto',
		height: 'fit-content',
		width: 'fit-conten',
	},
});

export function User() {
	const styles = useStyles();
	const [password, setPassWord] = useState('');
	const [confirmPassword, setconfirmPassword] = useState('');
	const [isPasswordNotMatching, setIsPasswordNotMatching] = useState(false);
	const ref = useRef();
	const { id } = useParams();
	const form = useRef(null);
	const [user, setUser] = useState(null);

	useEffect(() => {
		if (!id) {
			return;
		}
		axios
			.get(`/api/users/${id}`)
			.then(({ data }) => {
				setUser(data);
			})
			.catch((e) => {
				console.error(e);
			});
	}, [id]);

	useEffect(() => {
		if (password !== confirmPassword) {
			if (confirmPassword !== '') {
				setIsPasswordNotMatching(true);
			}
		} else {
			setIsPasswordNotMatching(false);
		}
	}, [password, confirmPassword]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const form = event.target;

		const password = form.password?.value;
		const newpassword = form.newpassword?.value;
		const confirmationpassword = form.confirmationpassword?.value;

		if (!password || !newpassword || !confirmationpassword) {
			return;
		}

		axios
			.post(`/api/auth/password/${id}`, form)
			.then(() => {})
			.catch(() => {
				console.error(`La mise a jour du mot de passe n'a pas reussie`);
			});
	};

	if (!user) {
		return (
			<div className={styles.spinner}>
				<Spinner />
			</div>
		);
	}

	return (
		<div>
			<p>{user?.firstname}</p>
			<p>{user?.lastname}</p>

			<EmailRenderer userId={id} defaultEmail={user?.emailAddress} />
			<form className={styles.form} onSubmit={handleSubmit} ref={form}>
				<Label required htmlFor={'password-input'}>
					Mot de passe
				</Label>

				<Input
					required
					type="password"
					id={'password-input'}
					name="password"
					className={styles.input}
				/>
				<Label required htmlFor={'password-input'}>
					Nouveau mot de passe
				</Label>
				<Input
					required
					type="password"
					id={'new-password-input'}
					name="newpassword"
					className={styles.input}
					onChange={(e) => {
						setPassWord(e.target.value);
					}}
				/>
				<Field
					label="Confirmer le mot de passe"
					validationState={isPasswordNotMatching ? 'error' : undefined}
					validationMessage={
						isPasswordNotMatching
							? 'Les mots de passes ne correspondent pas'
							: ''
					}>
					<Input
						required
						type="password"
						id={'password-confirmation-input'}
						name="confirmationpassword"
						onChange={(e) => {
							setconfirmPassword(e.target.value);
						}}
					/>
				</Field>

				<div ref={ref}></div>
				<Button type="submit" appearance="primary">
					enregistrer
				</Button>
			</form>
			<p>{user?.condition}</p>
			<p>{user?.Roles}</p>
		</div>
	);
}
