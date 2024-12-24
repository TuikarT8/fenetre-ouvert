import { Button, Tooltip } from '@fluentui/react-components';
import { Print32Filled } from '@fluentui/react-icons';
import PropTypes from 'prop-types';
import React from 'react';

export function PrintButton({ good }) {
	return (
		<div>
			<Tooltip
				content={'Imprimer une etiquette pour ce bien'}
				relationship="description">
				<Button
					vertical
					onClick={() => {
						window.open(`/api/goods/${good.id}/print`, '_blank');
					}}
					icon={<Print32Filled />}></Button>
			</Tooltip>
		</div>
	);
}

PrintButton.propTypes = {
	good: PropTypes.object.isRequired,
};
