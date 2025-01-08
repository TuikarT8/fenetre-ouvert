import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, tokens } from '@fluentui/react-components';
import {
	Hamburger,
	NavDrawer,
	NavDrawerBody,
	NavDrawerHeader,
	NavItem,
} from '@fluentui/react-nav-preview';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
	drawer: {
		height: '100%',
	},
	link: {
		textDecoration: 'none',
		color: tokens.colorNeutralForeground2Link,
	},
});

export function NavigationDrawer({ open, onToggleDrawerOpenState }) {
	const styles = useStyles();

	return (
		<NavDrawer
			open={true}
			defaultSelectedValue="1"
			defaultSelectedCategoryValue="1"
			type="inline"
			multiple={false}>
			<NavDrawerHeader>
				<Hamburger onClick={() => onToggleDrawerOpenState(false)} />
			</NavDrawerHeader>
			<NavDrawerBody className={styles.drawer}>
				<Link to="/" replace={true} className={styles.link}>
					<NavItem value="1">Accueil</NavItem>
				</Link>
				<Link to="/inventories/active" replace={true} className={styles.link}>
					<NavItem value="2">Inventaire</NavItem>
				</Link>
				<Link to="/inventories" replace={true} className={styles.link}>
					<NavItem value="3">Inventaires</NavItem>
				</Link>
				<Link to="historique" replace={true} className={styles.link}>
					<NavItem value="4">Historique</NavItem>
				</Link>
			</NavDrawerBody>
		</NavDrawer>
	);
}

NavigationDrawer.propTypes = {
	open: PropTypes.bool.isRequired,
	onToggleDrawerOpenState: PropTypes.func.isRequired,
};
