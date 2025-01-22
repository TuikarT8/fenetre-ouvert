import { uniqueId } from 'lodash';

export function convertStringToDate(dateString) {
	if (!dateString) {
		return undefined;
	}

	return new Date(dateString);
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
		: [{ id: uniqueId('good') }, { id: uniqueId('good') }];

	return _goods.map(({ id }) => id).reduce((p, c) => p.concat(c));
}

export function isZeroDate(date) {
	if (!date) {
		return true;
	}

	// Regexp to match 0001-01-01T00:00:00Z
	const regexp =
		/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z/;
	const matches = regexp.exec(date);
	if (!matches || matches.length === 1) {
		return false;
	}

	const [, year] = matches;

	if (!year) {
		return true;
	}

	if (Number(year) < 1970) {
		return true;
	}

	return false;
}

export * from './use-depencency-observer';
export * from './get-cookie';
