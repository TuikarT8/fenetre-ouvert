import * as React from 'react';
import {
	MessageBar,
	MessageBarTitle,
	MessageBarBody,
	Link,
	makeStyles,
} from '@fluentui/react-components';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
	main: {
		marginLeft: '16px',
		marginRight: '16px',
		marginBottom: '16px',
	},
});

export function InventoryMessageBox({ onShowGoods, count }) {
	const styles = useStyles();

	return (
		<MessageBar className={styles.main}>
			<MessageBarBody>
				<MessageBarTitle>Biens non inclus</MessageBarTitle>
				Il y a{' '}
				<Link
					to="/message"
					onClick={() => {
						onShowGoods();
					}}>
					{count}
				</Link>{' '}
				biens issus {"d'inventaires"} précédents non encore inclus dans cet
				inventaire.
			</MessageBarBody>
		</MessageBar>
	);
}

InventoryMessageBox.propTypes = {
	onShowGoods: PropTypes.func.isRequired,
	count: PropTypes.number.isRequired,
};
