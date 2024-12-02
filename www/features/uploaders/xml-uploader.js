import { Uploader } from "./uploader";
import { xml2js } from 'xml-js';

export class XMLUploader extends Uploader {
    convert() {
		return this.readFile().then((content) => {
			this.data = xml2js(content, {compact: true, spaces: 4});
		});
	}
} 