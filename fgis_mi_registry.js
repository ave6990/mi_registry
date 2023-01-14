// This script let download the mesurement instsrument database from FIF.

import { getPage } from './api/fgis_mi_registry_api.js'
import fs from 'fs'
import { toString } from './lib/date.js'

const d = new Date()
const cur_date = toString(d, '-', true)
const file_name = `registry_${cur_date}.csv`

const readData = async (page_size = 20, start_page = 1) => {
	let last_page = 9999999
	let res = []
	for (let i = start_page; i <= last_page; i++) {
		const data = await getPage(i, page_size)
		if (i == start_page) {
            fs.writeFileSync(file_name, Object.keys(data.data[0]).join(';').concat('\r\n'))
			last_page = parseInt(data.total_count / page_size) + 1
		}
		let percent = Math.round(parseFloat(i / last_page) * 10000) / 100
		writeData(data.data)
		console.log(`Getting ${i} page of ${last_page} [${percent} %]`)
	}
	return true
}

const writeData = (data) => {
    const replacer = (key, value) => value === null ? 'null' : value
    const header = Object.keys(data[0])
    const csv = [
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(';'))
    ].join('\r\n')

    fs.appendFileSync(file_name, csv)
}

readData(500, 6)

export { readData, writeData }
