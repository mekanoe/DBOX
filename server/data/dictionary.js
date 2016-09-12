const strings = {
	faction_id: {
		'1': 'VS',
		'2': 'NC',
		'3': 'TR',
	},

	vehicle_id: {
		'@': 'vID:',
		'0': 'Planetmans',
		'12': 'Harasser',
	}
}

module.exports = (type, id) => {
	return strings[type][id] || `${strings[type]['@']}${id}`
}