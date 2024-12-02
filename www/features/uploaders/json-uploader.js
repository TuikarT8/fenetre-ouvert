import { Uploader } from './uploader';

export class JSONUploader extends Uploader {
	convert() {
		return this.readFile().then((content) => {
			this.data = JSON.parse(content);
		});
	}
}