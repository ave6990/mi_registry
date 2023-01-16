// This script let download the mesurement instsrument database from FIF.

import { getPage } from './api/fgis_mi_registry_api.js'
import fs from 'fs'
import { toString } from './lib/date.js'

const d = new Date()
const cur_date = toString(d, '-', true)
const file_name = `registry_${cur_date}.csv`

const data_fields = [
    'fgis_id',
    'registry_number',
    'name',
    'types',
    'manufacturer_total',
    'manufacturer',
    'type_description',
    'verification_document',
    'procedure',
    'mi_info',
    'certificate_life',
    'serial_number',
    'verification_interval',
    'periodic_verification',
    'interval_years',
    'interval_months',
    'mi_status',
    'publication_date',
    'record_number',
    'party_verification',
    'status',
    'sort_key',
]

const readData = async (page_size = 20, start_page = 1) => {
	let last_page = 9999999
	let res = []
	for (let i = start_page; i <= last_page; i++) {
		const data = await getPage(i, page_size)

		if (i == start_page) {
            //fs.writeFileSync(file_name, Object.keys(data.data[0]).join(';').concat('\r\n'))
            fs.writeFileSync(file_name, data_fields.join(';').concat('\r\n'))
			last_page = parseInt(data.total_count / page_size) + 1
		}

		let percent = Math.round(parseFloat(i / last_page) * 10000) / 100
        fs.appendFileSync(file_name, packData(data.data, data_fields))
		console.log(`Getting ${i} page of ${last_page} [${percent} %]`)
	}
	return true
}

const packData = (data, data_fields) => {
    const replacer = (key, value) => (value === null || value == '') ? 'null' : value
    const csv = [
      ...data.map(row => data_fields.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(';'))
    ].join('\r\n')

    return csv.concat('\r\n')
}

readData(500, 1)

export { readData }
