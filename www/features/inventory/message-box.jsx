import * as React from 'react';
import { DismissRegular } from '@fluentui/react-icons';
import {
	MessageBar,
	MessageBarActions,
	MessageBarTitle,
	MessageBarBody,
	Button,
	Link,
	makeStyles,
} from '@fluentui/react-components';

const useStyles = makeStyles({
	main: {
		marginLeft: '16px',
		marginRight: '16px',
		marginBottom: '16px',
	},
});

export function InventoryMessageBox() {
	const styles = useStyles();
	return (
		<MessageBar className={styles.main}>
			<MessageBarBody>
				<MessageBarTitle>Biens non inclus</MessageBarTitle>
				Il y a <Link>{'123'}</Link> biens issus {"d'inventaires"} précédents non
				encore inclus dans cet inventaire.
			</MessageBarBody>
			<MessageBarActions
				containerAction={
					<Button
						aria-label="dismiss"
						appearance="transparent"
						icon={<DismissRegular />}
					/>
				}>
				<Button>Action</Button>
				<Button>Action</Button>
			</MessageBarActions>
		</MessageBar>
	);
}
