const superagent = require('superagent-promise')(require('superagent'), Promise)
const log = new (require('../logger'))('server/data/Character')
const { Map } = require('immutable')

const ENDPOINT = `http://census.daybreakgames.com/s:${process.env.SERVICE_ID}/get/ps2:v2/character/?character_id=`

////
// Outputs Planetmans data
//
// Arguments
//   anon obj{services obj{redis ioredis#Client, r rethinkdbdash#Client}}
class Character {
	constructor(services) {
		this.services = services
	}


	////
	// Gets a planetmans from the Census API by character ID.
	// 
	// Arguments
	//   id int
	// Returns Promise<obj{}>
	byID(id) {
		return new Promise((resolve, reject) => {
			this._getIdFromCache(id).then((data) => {
				resolve(data)
			}).catch((err) => {
				if (err === 'not found') {
					this._getIdFromApi(id).then((data) => {
						if (data === undefined || data === null) {
							reject(new Error('not found'))
						} else {
							process.nextTick(() => {this._cacheId(id, data)})
							resolve(data)
						}
					})
				}
			})
		})

	}


	////
	// Injects names and factions into a VehicleDestroy event
	//
	// Arguments
	//   evt Immutable#Map<VehicleDestroy>
	injectVehicleDestroyEvent(evt) {
		return new Promise((resolve, reject) => {
			let nevt = Map(evt)

			// inject victim name
			this.byID(nevt.get('character_id')).then((char) => {

				nevt = nevt.set('character_name', char.name.first)
						   .set('dbg_faction_id', nevt.get('faction_id'))
						   .set('faction_id', char.faction_id)

				// inject attacker
				this.byID(nevt.get('attacker_character_id')).then((charA) => {


					nevt = nevt.set('attacker_character_name', charA.name.first)
							   .set('attacker_faction_id', charA.faction_id)


					resolve(nevt)

				})

			})
		})
	}


	////
	// @internal
	// Check if a character ID is in the cache, and return it if so, or an error if not.
	//
	// Arguments
	//   id int
	// Returns Promise<obj{}>
	_getIdFromCache(id) {
		return this.services.redis.get(`character:${id}`).then((data) => {
			if (data !== null) {
				log.debug('cache hit', {id})
				return JSON.parse(data)
			} else {
				log.debug('cache miss', {id})
				throw 'not found'
			}
		})
	}


	////
	// @internal
	// Get a character from the Census API
	//
	// Arguments
	//   id int
	// Returns Promise<obj{}>
	_getIdFromApi(id) {
		return superagent.get(`${ENDPOINT}${id}`).then(data => {
			log.debug('requested from api', {id})
			if (data.body.character_list === undefined || data.body.character_list.length === 0) {
				return null
			}

			return data.body.character_list[0]
		}).catch(err => {
			log.error('api error', err)
		})
	}


	////
	// @internal
	// Commits a character to the cache to expire in 1 day.
	//
	// Arguments
	//   id   int
	//   data obj{}
	_cacheId(id, data) {
		log.debug('caching', {id, data})
		this.services.redis.set(`character:${id}`, JSON.stringify(data), 'EX', 86400)
	}
}

module.exports = Character