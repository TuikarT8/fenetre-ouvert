import * as React from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	makeStyles,
	useRestoreFocusSource,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
	root: {
		border: '2px solid #ccc',
		overflow: 'hidden',

		display: 'flex',
		height: '480px',
		backgroundColor: '#fff',
	},
});

export function MissingGoodProduct() {
	const styles = useStyles();
	const [isOpen, setIsOpen] = React.useState(false);

	const restoreFocusSourceAttributes = useRestoreFocusSource();

	return (
		<div className={styles.root}>
			<Drawer
				{...restoreFocusSourceAttributes}
				separator
				open={isOpen}
				onOpenChange={(_, { open }) => setIsOpen(open)}>
				<DrawerHeader>
					<DrawerHeaderTitle
						action={
							<Button
								appearance="subtle"
								aria-label="Close"
								icon={<Dismiss24Regular />}
								onClick={() => setIsOpen(false)}
							/>
						}>
						Missing Goods Product
					</DrawerHeaderTitle>
				</DrawerHeader>

				<DrawerBody>
					<p>Drawer content</p>
				</DrawerBody>
			</Drawer>
		</div>
	);
}
