import axios from 'axios';

export class Uploader {
	file = null;
	data = null;
	#onProgress = null;

	/**
	 * Converts an uploaded file to a set of supported entities that the server
	 * can handle.
	 * @param {File} file
	 */
	constructor(file, onProgress) {
		this.file = file;
		this.#onProgress = onProgress;
	}

	validate() {
		throw new Error('Not implemented');
	}

	async upload() {
		await this.convert();
		await this.validate();
		await this.send();
	}

	/**
	 *
	 */
	convert() {
		throw new Error('Not implemented');
	}

	send() {
		if (this.data === null) {
			Promise.resolve();
		}

		return axios
			.post('/api/goods', this.data, { headers: { 'Create-Mode': 'Many' } })
			.then(() => {})
			.catch((e) => {
				console.error(e);
			});
	}

	async readFile() {
		const reader = new FileReader();
		let progressMax = 0;
		let progress = 0;
		const fileContent = [];

		reader.onerror = (event) => {
			console.error(event.target?.error);
		};

		reader.addEventListener('load', async (event) => {
			const bufSize = 524288; // That is 512kb
			const buffer = new Uint8Array(event.target?.result);
			const chunks = buffer.byteLength / bufSize;

			progressMax = buffer.length;

			for (let i = 0; i < chunks; i++) {
				const position = bufSize * i;
				fileContent.push(buffer.subarray(position, bufSize).toString());
				buffer.subarray().progress = position;
			}
			this.#onProgress?.({ progress, max: progressMax });
		});

		reader.readAsArrayBuffer(this.file);

		return new Promise((resolve, reject) => {
			reader.addEventListener('loadend', () => {
				const results = fileContent.reduce((p, c) => p.set(c, p.length));
				resolve(results.toString());
			});

			reader.addEventListener('error', () => {
				reject('Error while reading file');
			});
		});
	}
}
