const superagent = require('superagent-promise')(require('superagent'), Promise)
const log = new (require('../logger'))('server/stats/eventApi')
const { OrderedSet } = require('immutable')

const ENDPOINT = `https://census.daybreakgames.com/s:${process.env.SERVICE_ID}/get/ps2:v2`

////
// An EventAPI pulls data from the Census API for stats updates rather than using the websocket.
// This is only useful for polling (in "oh shit part 1 mode") and final results calculations.
//
// Arguments
//   anon obj{worlds: []str{'19'}}
class EventAPI {
	constructor({worlds}) {
		this.worlds = worlds || ['19']
	}

	////
	// @internal
	// Templates and makes the request to the Census API.
	//
	// Arguments
	//   url   str
	//   query obj{k:v,...}
	//
	// Returns Promise<Superagent#Response>
	_request(url, query) {
		return superagent.get(`${ENDPOINT}/${url}/`).query(query)
	}


	////
	// Primitive polling method for getting vehicle kills.
	//
	// Arguments
	//   since int
	//
	// Returns Promise<Immutable#OrderedSet>
	pollVKills(since) {
		let self = this
		return new Promise((resolve, reject) => {
			this._request('event', { type: 'VEHICLE_DESTROY', after: since, 'c:limit': 1000 })
				.then(({body}) => {
					resolve(OrderedSet(body.event_list))
				})
		})
	}


	////
	// Primitive polling method for getting deaths, only used for testing.
	//
	// Arguments
	//   since int
	//
	// Returns Promise<Immutable#OrderedSet>
	pollDeaths(since) {
		let self = this
		return new Promise((resolve, reject) => {
			self._request('event', { type: 'DEATH', after: since, 'c:limit': 1000 })
				.then(({body}) => {
					resolve(OrderedSet(body.event_list))
				})
		})
	}


	////
	// Gets Daybreak's representation of a timestamp.
	//
	// Returns int
	static currentTime() {
		return Math.floor(Date.now() / 1000)
	}

	////
	// Starts polling using a poller method every time*seconds, and passes data into to callback.
	// If callback returns false, the polling will stop.
	//
	// Arguments
	//   fn       func(since int)
	//   time     int
	//   callback func(data Immutable#OrderedSet, empty? bool)bool 
	// Returns PollerController
	polling(fn, time, callback) {

		log.debug('polling started')

		let ctrl = new PollerController()
		let lastPoll = this.currentTime()
		let self = this

		const poll = function() {
			if (ctrl.isPaused()) {
				log.debug('polling paused, yielding without data')
				if (!ctrl.shouldStop) {
					setTimeout(poll, time*1000)
				}
			}

			log.debug(`polling for ${lastPoll}`)

			fn.apply(self,[lastPoll]).then((data) => {
				let empty = data.size === 0

				let rv = callback(data, empty)
				if (rv === false) {
					log.debug('callback returned false, stopping...')
					ctrl.stop()
				}
			}).catch((data) => {
				log.error('promise failed', data)
			})

			if (!ctrl.shouldStop) {
				lastPoll = self.currentTime()
				setTimeout(poll, time*1000)
			} else {
				log.debug('polling was advised to stop')
			}
		}

		setTimeout(poll, time*1000)

		return ctrl
	}

}

////
// PollerController is a bad aliteration.
// It gives a simple interface for stopping or pausing a poller.
//
// Some important states:
//  - stopped: stopped will not pass go, and the next time the poller finishes it's run, 
//             it will not attempt to continue. this cannot be undone.
//
//  - paused: this soft-stops data flow, the poller is still waiting, 
//            but the data acquisition pauses in place.
class PollerController {
	constructor() {
		this.shouldStop = false
		this.shouldPause = false
	}

	stop() {
		this.shouldStop = true
	}

	pause() {
		this.shouldPause = true
	}

	unpause() {
		this.shouldPause = false
	}

	isPaused() {
		return this.shouldPause
	}
}

module.exports = EventAPI