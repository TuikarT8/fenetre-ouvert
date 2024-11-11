import * as React from 'react';
import { Button, makeStyles, Text } from '@fluentui/react-components';
import {
	PortUsbCFilled,
	Triangle32Filled,
	TriangleDown32Filled,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
	main: {
		gap: '16px',
		display: 'flex',
		flexWrap: 'wrap',
	},

	box: {
		width: '100%',
		maxWidth: '100%',
		height: 'fit-content',
	},
	img: {
		width: '100%',
		height: 'fit-content',
	},

	statImg: {
		width: '100%',
		height: '25%',
	},
});

export const GoodCard = () => {
	const styles = useStyles();

	return (
		<div className={styles.main}>
			<div className={styles.box}>
				<div>
					<img
						className={styles.img}
						src={'https://placehold.co/300x200'}
						alt="Presentation Preview"
					/>
				</div>

				<div>
					<Text size="500" weight="semibold">
						200$
					</Text>
					<Button
						icon={<Triangle32Filled />}
						appearance="transparent"
						aria-label="More actions"
					/>

					<Button
						icon={<TriangleDown32Filled />}
						appearance="transparent"
						aria-label="More actions"
					/>

					<Button
						icon={<PortUsbCFilled />}
						appearance="transparent"
						aria-label="More actions"
					/>
				</div>

				<div>
					<img
						className={styles.statImg}
						src={'https://placehold.co/25x10'}
						alt="Presentation Preview"
					/>
				</div>
			</div>
		</div>
	);
};
