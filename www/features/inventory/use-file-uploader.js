import { useEffect, useMemo, useState } from 'react';
import { JSONUploader } from '../uploaders';
import { useInventory } from '../../provider';
import { XMLUploader } from '../uploaders/xml-uploader';
import { CSVUploader } from '../uploaders/csv-uploader';

export function useFileUploader() {
	const { addGoods, addGood } = useInventory();
	const [file, setFile] = useState(null);
	const uploader = useMemo(() => {
		if (!file) {
			return null;
		}

		const fileNameLower = file.name.toLowerCase();
		if (fileNameLower.includes('.json')) {
			return new JSONUploader(file);
		} else if (fileNameLower.includes('.xml')) {
			return new XMLUploader(file);
		} else if (fileNameLower.includes('.csv')) {
			return new CSVUploader(file);
		}

		return null;
	}, [file?.name]);

	useEffect(() => {
		uploader?.upload().then((goods) => {
			if (goods.length) {
				addGoods(goods);
			} else {
				addGood(goods);
			}
		});
	}, [uploader]);

	function onFileUpload(event) {
		const file = event.target.files[0];

		if (file) {
			setFile(file);
		}
	}

	return { onFileUpload };
}
