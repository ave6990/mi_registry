import axios 'axios'
import * as urlLib from '../lib/url.js'
import * as dateLib '../lib/date.js'

const registryRecords = async (filter_obj) => {
	try {
		const url = urlLib.getUrl('https://fgis.gost.ru/fundmetrology/api/registry/4/data', filter_obj)
		const res = await axios.get(url)
		return res.data.result
	} catch (err) {
		console.log('fgis_api.js error!!!')
	}
}

const getPage = async (page, page_size = 20) => {
	let res = []
	let res_data = {}

	if (page_size > 1000) {
		throw 'Too much value. This may crash the FIF!!!'
	}

	const filter_obj = {
		pageNumber: page,
		pageSize: page_size,
		orgID: 'CURRENT_ORG',
	}

	const data = await registryRecords(filter_obj)
	res_data.total_count = data.totalCount
	filter_obj.pageNumber = filter_obj.pageNumber + 1

	for (const [i, item] of data.items.entries()) {
		res[i] = parseData(item.properties)
	}
	res_data.data  = res
	return res_data
}

const getValue = (fields, name, link = false) => {
	const vals = fields.filter( (field) => {
		return field.name == name
	} )
	if (vals.length > 0) {
		if (link) {
			return vals[0].link
		} else {
			return vals[0].value
		}
	} else {
		return undefined
	}
}

const getObjects = (value, data_fields, fgis_fields) => {
	let manufacturer_obj = []
	for (const [i, fields] of value.entries()) {
		obj = {}
		for (const [i, field] of data_fields.entries()) {
			obj[field] = getValue(fields.fields, fgis_fields[i])
		}
		manufacturer_obj[i] = obj
	}
	return manufacturer_obj
}

const parseData = (fields) => {
	const data = {}
	const data_fields = {
		'id': 'fgis_id',
		'foei:NumberSI': 'registry_number',
		'foei:NameSI': 'name',
		'foei:DesignationSI': 'types',
		'foei:ManufacturerTotalSI': 'manufacturer_total',
		'foei:SI2_assoc': 'manufacturer',
		'foei:DescriptionSI': 'type_description',
		'foei:MethodVerifSI': 'verification_document',
		'foei:ProcedSI': 'procedure',
		'foei:SvedenSI': 'mi_info',
		'foei:CertificateLifeSI': 'certificate_life',
		'foei:FactoryNumSI': 'serial_number',
		'foei:MPISI': 'verification_interval',
		'foei:NextVerifSI': 'periodic_verification',
		'foei:YearSI': 'interval_years',
		'foei:MonthsSI': 'interval_months',
		'foei:StatusSI': 'mi_status',
		'foei:date': 'publication_date',
		'foei:number': 'record_number',
		'foei:partVerifSI': 'party_verification',
		'foei:status': 'status',
		'foei:sortKey': 'sort_key',
	}
	const data_manufacturer_fields = ['country', 'location', 'notice', 'name']
	const fgis_manufacturer_fields = ['foei:CountrySI', 'foei:SettlementSI',
		'foei:UvedSI', 'foei:ManufacturerSI']
	for( const field of fields) {
		if (field.name == 'foei:SI2_assoc') {
			let manufacturer = getValue(fields, field.name)
			data[data_fields[field.name]] = getObjects(manufacturer, data_manufacturer_fields,
				fgis_manufacturer_fields)
		} else if (field.name == 'foei:date' || field.name == 'foei:CertificateLifeSI') {
			let str = getValue(fields, field.name)
			data[data_fields[field.name]] = dateLib.toDate(str)
		} else if (['foei:DescriptionSI', 'foei:MethodVerifSI'].indexOf(field.name) >= 0) {
			data[data_fields[field.name]] = getValue(fields, field.name, true)
		} else {
			data[data_fields[field.name]] = getValue(fields, field.name)
		}
	}
	return data
}

export { getPage }
