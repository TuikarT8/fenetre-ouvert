import QRCode from 'qrcode';

export function GenerateQrCode() {
	const qrcode = new QRCode(
		document.getElementById('qrcode', {
			texte: 'http://www.geeksforgeeks.org',
			largeur: 256,
			hauteur: 256,
			colorDark: '#000000',
			colorLight: '#ffffff',
		}),
	);

	console.log(qrcode);
}
