import { Uploader } from "./uploader";

export class CSVUploader extends Uploader {
    convert() {
		return this.readFile().then((content) => {
			this.data = this.csvToJs(content);
		});
	}

    /**
     * 
     * @param {String} content 
     */
    csvToJs(content) {
        const lines = content.split(/[\r\n]+/);
        if (!lines.length) {
            throw new Error('Invalid CSV file');
        }

        const regexp = /(,)(?=(?:[^"]|"[^"]*")*$)/
        const header = lines[0].split(",");
        const numberRegexp = /[0-9]+/
        const booleanRegexp = /(true)|(false)/;
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const entry = {};
            const line = lines[i];
            if (!line) {
                continue;
            }
            
            const values = line.split(regexp).filter(token => token !== ',');
            header.forEach((key, index) => {
                const value = values[index]?.replaceAll('"', "");
                if (numberRegexp.test(value)) {
                    entry[key] = Number(value);
                } else if (booleanRegexp.test(value)) {
                    entry[key] = value === 'true';
                } else {
                    entry[key] = value;
                }
                
            });
            data.push(entry);
        }

        return data;
    }
}