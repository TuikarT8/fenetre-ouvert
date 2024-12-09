import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	Drawer,
	Button,
	Input,
	makeStyles,
	Field,
	Dropdown,
	Option,
	DrawerFooter,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import axios from 'axios';
import _ from 'lodash';

const useStyles = makeStyles({
	content: {
		display: 'flex',
		flexDirection: 'column',
		rowGap: '10px',
	},
	statImg: {
		width: '100%',
		height: '25%',
	},
});

const stateMap = {
	mauvais: 'Mauvais',
	bon: 'Bon',
	excellent: 'Excellent',
	'tres-mauvais': 'Très mauvais',
};

function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

export const GoodEditorDrawer = ({
	isOpen,
	selectedGood,
	onClose,
	isDisabled,
	sessionId,
}) => {
	const styles = useStyles();
	const [shouldCreateChange, setShouldCreateChange] = useState(false);
	const [goodChange, setGoodChange] = useState({
		sessionId,
		saleValue: selectedGood.purchaseValue,
	});
	const [originalGoodChange, setOriginalGoodChange] = useState();
	const [good, setGood] = useState(selectedGood);
	const hasActiveChanges = useMemo(() => {
		return (
			!_.isEqual(originalGoodChange, goodChange) ||
			!_.isEqual(selectedGood, good)
		);
	}, [
		JSON.stringify(originalGoodChange),
		JSON.stringify(goodChange),
		JSON.stringify(good),
		JSON.stringify(selectedGood),
	]);
	const form = useRef(null);

	const handleSubmitForm = (_form) => {
		var _good = {
			..._.pick(good, 'count', 'name'),
			sessionId,
			change: {
				condition: goodChange.condition,
				saleValue: parseInt(_form.valeur.value),
				countDelta: goodChange.countDelta,
			},
		};

		if (!goodChange) {
			console.error('No product change to mmodify sessionId=%s', sessionId);
			return;
		}

		if (shouldCreateChange) {
			axios
				.post(`/api/goods/${selectedGood.id}/changes`, goodChange)
				.then(function () {
					onClose?.(
						{
							...selectedGood,
							changes: [...(selectedGood.changes || []), goodChange],
						},
						true,
					);
				})
				.catch((e) => {
					console.error(e);
				});
		} else {
			axios
				.patch(`/api/goods/${selectedGood.id}`, _good)
				.then(function ({ data }) {
					onClose?.(data);
				})
				.catch((e) => {
					console.error(e);
				});
		}
	};

	useEffect(() => {
		const defaultChange = { sessionId, saleValue: selectedGood.purchaseValue };
		const sessionChange = selectedGood?.changes?.find(
			(c) => c.sessionId === sessionId,
		);
		if (!sessionChange) {
			setShouldCreateChange(true);
		}

		setGoodChange(sessionChange || defaultChange);
		setOriginalGoodChange(sessionChange || defaultChange);
		setGood(selectedGood);
	}, [sessionId, JSON.stringify(selectedGood)]);

	console.log('Avant le if');

	if (!selectedGood) return null;

	console.log('Apres le if');

	return (
		<Drawer
			open={isOpen}
			position="end"
			size="medium"
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
					{capitalizeFirstLetter(selectedGood.name)}
				</DrawerHeaderTitle>
			</DrawerHeader>
			<DrawerBody>
				<form onSubmit={handleSubmitForm} ref={form}>
					<div>
						<img
							className={styles.statImg}
							src={'https://placehold.co/25x10'}
							alt="Presentation Preview"
						/>
					</div>
					<Field label={'Valeur courante'} required>
						<Input
							required
							type="number"
							name="valeur"
							defaultValue={goodChange?.saleValue}
							disabled={isDisabled}
						/>
					</Field>
					<Field label={'Etat'} required>
						<Dropdown
							required
							name="etat"
							defaultValue={stateMap[goodChange.condition]}
							defaultSelectedOptions={[goodChange.condition]}
							disabled={isDisabled}>
							<Option
								value="excellent"
								onClick={() =>
									setGoodChange({ ...goodChange, condition: 'excellent' })
								}>
								Excellent
							</Option>
							<Option
								value="bon"
								onClick={() =>
									setGoodChange({ ...goodChange, condition: 'bon' })
								}>
								Bon
							</Option>
							<Option
								value="mauvais"
								onClick={() =>
									setGoodChange({ ...goodChange, condition: 'mauvais' })
								}>
								Mauvais
							</Option>
							<Option
								value="tres-mauvais"
								onClick={() =>
									setGoodChange({ ...goodChange, condition: 'tres-mauvais' })
								}>
								Très mauvais
							</Option>
						</Dropdown>
					</Field>

					<Field label={'Quantite'}>
						<Input
							type="number"
							name="count"
							defaultValue={selectedGood.count}
							onChange={(e, data) => {
								setGood({ ...good, count: Number(data.value) });

								if (Number(data.value)) {
									setGoodChange({
										...goodChange,
										countDelta: Number(data.value) - good.count,
									});
								}
							}}
							disabled={isDisabled}
						/>
					</Field>
				</form>
			</DrawerBody>
			<DrawerFooter>
				<Button appearance="secondary" onClick={() => onClose?.()}>
					Annuler
				</Button>
				<Button
					appearance="primary"
					onClick={() => {
						handleSubmitForm(form.current);
					}}
					disabled={!hasActiveChanges}>
					Enregistrer
				</Button>
			</DrawerFooter>
		</Drawer>
	);
};

GoodEditorDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	isDisabled: PropTypes.bool.isRequired,
	selectedGood: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	sessionId: PropTypes.string,
};
