const eventApi = require('./eventApi')
const log = new (require('../logger'))('server/stats/eventApi_test', true)

let worlds = ['1']
let vehicles = ['12']

const api = new eventApi({worlds})

function filter(data) {
	return data.filter(v => vehicles.indexOf(v.attacker_vehicle_id) !== -1 && worlds.indexOf(v.world_id) !== -1)
}

function secondStepPoller() {
	var counter = 1
	api.polling(api.pollVKills, 1, (data, empty) => {
		data = filter(data)

		if (data.size === 0) {
			// log.info('empty data')
		} else {
			log.info('got data', data.toJS())
		}


		if ( counter % 10 === 0 ) {
			log.debug('counter is divisible by 10, stopping...')
			return false
		} else {
			counter = counter + 1
			// log.debug('counter', counter)
		}
	})
}

const poller = api.polling(api.pollVKills, 1, (data, empty) => {
	data = filter(data)

	if (data.size === 0) {
		// log.info('empty data')
		return
	}

	log.info('got data', data.toJS())
})

setTimeout(() => {
	poller.stop()
	log.notice('stopped polling via controller')

	log.info('starting second poller')
	secondStepPoller()
}, 10000)

