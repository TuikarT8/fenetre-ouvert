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