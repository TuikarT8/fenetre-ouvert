import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Field, Input, Label, makeStyles } from '@fluentui/react-components';
import { useParams } from 'react-router-dom';
import { set } from 'lodash';

const useStyles = makeStyles({
	container: {
		height: '100%',
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		width: '200px',
		height: '500px',
	},
	input: {
		marginBottom: '16px',
	},
});

export function User() {
	const styles = useStyles();
	//const navigate = useNavigate();
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
			if(confirmPassword !== "" ) {
				setIsPasswordNotMatching(true)
			}
		} else {
			setIsPasswordNotMatching(false)
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
				console.error("La mise a jour du mot de passe n'a pas reussi");
			});
	};

	return (
		<div>
			<p>{user?.firstname}</p>
			<p>{user?.lastname}</p>
			<p>{user?.emailAddress}</p>

			<form className={styles.form} onSubmit={handleSubmit} ref={form}>
				<Label required htmlFor={'password-input'}>
					Password
				</Label>
					
				<Input
					required
					type="password"
					id={'password-input'}
					name="password"
					className={styles.input}
				/>
				<Label required htmlFor={'password-input'}>
					Nouveau Mot de passe
				</Label>
				<Input
					required
					type="password"
					id={'password-input'}
					name="newpassword"
					className={styles.input}
					onChange={(e) => {
						setPassWord(e.target.value);
					}}
				/>
				<Label required htmlFor={'password-input'}>
					Confirmer le mot de passe
				</Label>
					
					<Input
						required
						type="password"
						id={'password-input'}
						name="confirmationpassword"
						onChange={(e) => {
							setconfirmPassword(e.target.value);
						}}
					/>
					{isPasswordNotMatching && <Field
						validationState="warning"
						validationMessage="Le mot de passe n'est pas identique"
						size="medium"
    				>
				</Field>}

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
