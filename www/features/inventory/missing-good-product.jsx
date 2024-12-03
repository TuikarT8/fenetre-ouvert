import React, { useState, useEffect } from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	makeStyles,
	useRestoreFocusSource,
	TableRow,
	TableCell,
	TableCellLayout,
} from '@fluentui/react-components';
import {
	AddFilled,
	Dismiss24Regular,
	EditRegular,
} from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import { PreviousSessionGoodDeleteConfirmationPopover } from './delete-popOver';
import { useInventory } from '../../provider';

function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

const useStyles = makeStyles({
	root: {
		border: '2px solid #ccc',
		overflow: 'hidden',

		display: 'flex',
		height: '480px',
		backgroundColor: '#fff',
	},

	button: {
		margin: '8px',
	},
});

export function GoodsNotInSessionDrawer({ open, onClose }) {
	const { session } = useInventory();
	const styles = useStyles();
	const restoreFocusSourceAttributes = useRestoreFocusSource();
	const [goods, setGoods] = useState([]);

	useEffect(() => {
		if (session?.goodsNotInSession) {
			setGoods(session.goodsNotInSession);
		}
	}, [JSON.stringify(session?.goodsNotInSession)]);

	return (
		<div className={styles.root}>
			<Drawer
				{...restoreFocusSourceAttributes}
				separator
				size={'medium'}
				position={'end'}
				open={open}
				onOpenChange={(_, { open }) => {
					if (!open) onClose();
				}}>
				<DrawerHeader>
					<DrawerHeaderTitle
						action={
							<Button
								appearance="subtle"
								aria-label="Close"
								icon={<Dismiss24Regular />}
								onClick={() => onClose()}
							/>
						}>
						Missing Goods Product
					</DrawerHeaderTitle>
				</DrawerHeader>

				<DrawerBody>
					{(goods || []).map((item) => {
						return (
							<TableRow key={item.id}>
								<TableCell>
									<TableCellLayout>
										{capitalizeFirstLetter(item.name)}
									</TableCellLayout>
								</TableCell>
								<TableCell>
									<TableCellLayout key={item.id}></TableCellLayout>
								</TableCell>
								<TableCell role="gridcell" tabIndex={0}>
									<TableCellLayout>
										<PreviousSessionGoodDeleteConfirmationPopover />
										<Button icon={<EditRegular />} aria-label="Modifier" />
										<Button icon={<AddFilled />} aria-label="Ajouter" />
									</TableCellLayout>
								</TableCell>
							</TableRow>
						);
					})}
				</DrawerBody>
			</Drawer>
		</div>
	);
}

GoodsNotInSessionDrawer.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};
