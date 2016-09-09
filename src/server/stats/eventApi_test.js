const eventApi = require('./eventApi')
const log = new (require('../logger'))('server/stats/eventApi_test', true)

let api = new eventApi({worlds: ['1']})

api.singlePollVKills(api.currentTime() - 300).then((d) => {
	log.info('got data', d.toJS())
})