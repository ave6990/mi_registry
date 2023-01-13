// This script let download the mesurement instsrument database from FIF.

import { getPage } from './api/fgis_mi_registry_api.js'

const readData = async (page_size = 20) => {
	let last_page = 3
	let res = []
	for (let i = 1; i <= last_page; i++) {
		const data = await getPage(i, page_size)
		if (i == 1) {
			last_page = parseInt(data.total_count / page_size) + 1
		}
		let percent = Math.round(parseFloat(i / last_page) * 10000) / 100
		console.log(`Getting ${i} page of ${last_page} [${percent} %]`)
		writeData(data.data)
	}
	return true
}

const writeData = (data) => {
    console.log(data)
}

readData()

export { readData, writeData }
