const EventStream = require('./eventStream')
const EventAPI = require('./eventApi')
const log = new (require('../logger'))('server/stats/eventStream_test')

const api = new EventAPI({worlds: ['1']})
let stream = new EventStream({world: 'Connery_1', eventNames: ['VehicleDestroy']})

stream.on('VehicleDestroy', (data) => {
	log.info('data', data)
})
