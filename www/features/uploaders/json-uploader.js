import { Uploader } from './uploader';

export class JSONUploader extends Uploader {
	convert() {
		return this.readFile().then((content) => {
			this.data = JSON.parse(content);
		});
	}

	validate() {
		if (
			!this.data.every((obj) => {
				const keys = Object.keys(obj);
				return (
					keys.includes('name') &&
					keys.includes('count') &&
					keys.includes('purchaseValue')
				);
			})
		) {
			throw new Error(
				'Les données du fichier ne correspondent pas au format indiqué',
			);
		}
	}
}
