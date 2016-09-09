const superagent = require('superagent-promise')(require('superagent'), Promise)
const log = new (require('../logger'))('server/stats/eventApi', true)
const { Set } = require('immutable')

const ENDPOINT = 'https://census.daybreakgames.com/s:PomfDBOX/get/ps2:v2'

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
	// Returns Promise<Immutable#Set>
	singlePollVKills(since) {
		return new Promise((resolve, reject) => {
			this._request('event', { type: 'VEHICLE_DESTROY', after: since, 'c:limit': 1000 })
				.then(({body}) => {
					resolve(Set(body.event_list))
				})
		})
	}


	////
	// @static
	// Gets Daybreak's representation of a timestamp.
	//
	// Returns int
	currentTime() {
		return Math.floor(Date.now() / 1000)
	}
}

module.exports = EventAPI