import {
	makeStyles,
	mergeClasses,
	themeToTokensObject,
	ToolbarButton,
	Tooltip,
	webLightTheme,
} from '@fluentui/react-components';
import { ScanDash32Filled } from '@fluentui/react-icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';

const tokens = themeToTokensObject(webLightTheme);
const useStyles = makeStyles({
	scannerBox: {
		position: 'fixed !important',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		width: '500px',
		height: 'fit-content',
		'z-index': 10000,
		display: 'none',
		margin: 'auto',
		backgroundColor: tokens.colorNeutralBackground1,
		boxShadow: tokens.shadow28,
		borderRadius: tokens.borderRadiusLarge,
		border: 'none',
		padding: '8px',
	},
	scanBoxVisible: {
		display: 'flex',
	},
});

export function GoodScanner({ onGoodScanned }) {
	const styles = useStyles();
	const scannerRef = useRef(null);
	const [isScanRequested, setIsScanRequested] = useState(false);
	const scanner = useMemo(
		() =>
			scannerRef.current
				? new Html5QrcodeScanner('reader', {
						fps: 10,
						qrbox: 250,
					})
				: null,
		[scannerRef.current],
	);

	const onScanSuccess = (decodedText) => {
		onGoodScanned(decodedText)
		setIsScanRequested(false);
		scanner?.clear();
	};

	const scanQRCode = () => {
		if (!scannerRef.current) {
			return;
		}

		setIsScanRequested(true);
		scanner?.render(onScanSuccess);
	};

	return (
		<div>
			<div
				className={mergeClasses(
					styles.scannerBox,
					isScanRequested ? styles.scanBoxVisible : undefined,
				)}
				ref={scannerRef}
				id="reader"></div>
			<Tooltip content={'Scanner un bien'} relationship="description">
				<ToolbarButton
					vertical
					onClick={() => scanQRCode()}
					icon={<ScanDash32Filled />}>
					Scanner
				</ToolbarButton>
			</Tooltip>
		</div>
	);
}

GoodScanner.propTypes = {
	onGoodScanned: PropTypes.func.isRequired,
}