import { Button, Input, Label, makeStyles } from '@fluentui/react-components';
import axios from 'axios';
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
		height: '200px',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
	input: {
		marginBottom: '16px',
	},
});

export function Login() {
	const styles = useStyles();
	const navigate = useNavigate();
	const form = useRef(null);

	const handleSubmit = (event) => {
		event.preventDefault();
		const form = event.target;

		const username = form.emailaddress?.value;
		const password = form.password?.value;
		
		if (!username || !password) {
			return;
		}

		axios
			.post('/api/auth/login', form)
			.then(() => {
				navigate('/');
			})
			.catch(() => {
				console.error("L'authentification n'a pas reussi");
		});
	};

	useEffect(() => {
		const cookieParts = document.cookie.split(';');
		const jwtCookie = cookieParts.find((part) => part.trim().startsWith('jwt'));

		if (jwtCookie) {
			axios.post('/api/auth/verify', {})	
			.then(({ data }) => {
				if (data.valid) {
					navigate('/');
					return;
				} else {
					const otherCookies = cookieParts.filter(part => part.trim().startsWith('jwt'));
					document.cookie = otherCookies.map(part => part.trim()).join('; ');
				}
			}).catch((e) => {
				console.error(e);
				navigate('/error');
				return
			});
		}
	}, []);

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit} ref={form}>
				<Label required htmlFor={'email-input'}>
					Email
				</Label>
				<Input
					className={styles.input}
					required
					type="email"
					id={'email-input'}
					name="emailaddress"
				/>
				<Label required htmlFor={'password-input'}>
					Password
				</Label>
				<Input
					className={styles.input}
					required
					type="password"
					id={'password-input'}
					name="password"
				/>
				<Button type="submit" appearance="primary">
					Submit
				</Button>
				<Link to="/signinup">Enregistrez-vous</Link>
			</form>
		</div>
	);
}
