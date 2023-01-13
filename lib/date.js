const toDate = (str) => {
	const delimiter_list = ['.', ',', ':', '/', '-']
	const delimiter = delimiter_list.filter( (d) => {
		return str.indexOf(d) != -1
	} )
	if (delimiter.length == 0) {
		throw 'Delimiter not found. May be a wrong expression.'
	}
	const [ day, month, year ] = str.split(delimiter[0])

	return new Date(year, month - 1, day)
}

const toString = (date, delimiter='-', iso = false) => {
	const day = firstZero(date.getDate())

	if (isNaN(day)) {
		return undefined
	}

	const month = firstZero(date.getMonth() + 1)
	const year = date.getFullYear()
    if (iso) {
        return [year, month, day].join(delimiter)
    } else {
    	return [day, month, year].join(delimiter)
    }
}

const firstZero = (val) => {
	if (val < 10) {
		return `0${val}`
	} else {
		return `${val}`
	}
}

export { toDate, toString }
