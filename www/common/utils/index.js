import { uniqueId } from "lodash";

export function convertStringToDate(dateString) {
	if (dateString === undefined || dateString === null) {
		return '';
	}

	const date = new Date(dateString);
	return date.toDateString();
}

export function capitalizeFirstLetter(elem) {
	if (elem == undefined || elem == null) {
		return;
	} else {
		return elem.charAt(0).toUpperCase() + elem.slice(1);
	}
}

export function hashGood(good) {
	return good.id || uniqueId('good');
}

/**
 * 
 * @param {{id: string}[]} goods 
 * @returns 
 */
export function hashGoods(goods) {
	const _goods = goods?.length
		? goods
		: [{id: uniqueId('good')}, {id: uniqueId('good')}];

	return _goods.map(({ id }) => id).reduce((p, c) => p.concat(c));
}

export * from './use-depencency-observer';