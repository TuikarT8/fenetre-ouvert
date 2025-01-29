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
	tokens,
} from '@fluentui/react-components';
import {
	Add12Filled,
	AddFilled,
	Dismiss24Regular,
	Edit12Regular,
	EditRegular,
} from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import { PreviousSessionGoodDeleteConfirmationPopover } from './delete-popOver';
import { useInventory } from '../../provider';
import { useAppContext } from '../../common';

function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

const useStyles = makeStyles({
	actionButtonAdd: {
		marginLeft: '4px',
	},
});

export function GoodsNotInSessionDrawer({ open, onClose }) {
	const {stagingGoods} = useAppContext();
	const styles = useStyles();
	const restoreFocusSourceAttributes = useRestoreFocusSource();
	const [goods, setGoods] = useState([]);

	useEffect(() => {
		if (stagingGoods) {
			setGoods(stagingGoods);

		}
	}, [JSON.stringify(stagingGoods)]);

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
										<Button className={styles.actionButtonAdd} icon={<Edit12Regular />} aria-label="Modifier" />
										<Button className={styles.actionButtonAdd} icon={<Add12Filled />} aria-label="Ajouter" />
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
