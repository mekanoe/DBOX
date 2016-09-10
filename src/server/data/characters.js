const superagent = require('superagent-promise')(require('superagent'), Promise)
const log = new (require('../logger'))('server/data/characters')

const ENDPOINT = 'http://census.daybreakgames.com/get/ps2:v2/character/?character_id='

class CharacterFactory {
	constructor({ services }) {
		this.services = services
	}

	getNameById(id) {
		return new Promise((resolve, reject) => {
			this._getIdFromCache(id).then((data) => {
				resolve(data.name.first)
			}).catch((err) => {
				if (err === 'not found') {
					this._getIdFromApi(id).then((data) => {
						if (data === undefined) {
							reject('not found')
						} else {
							process.nextTick(() => {this._cacheId(id, data)})
							resolve(data.name.first)
						}
					})
				}
			})
		})

	}

	_getIdFromCache(id) {
		return new Promise((resolve, reject) => {
			this.services.redis.get(`character:${id}`).then((data) => {
				if (data !== null) {
					log.debug('cache hit', {id})
					resolve(JSON.parse(data))
				} else {
					log.debug('cache miss', {id})
					reject('not found')
				}
			})
		})
	}

	_getIdFromApi(id) {
		return superagent.get(`${ENDPOINT}${id}`).then(data => {
			log.debug('requested from api', {id})
			return data.body.character_list[0]
		}).catch(err => {
			log.error('api error', err)
		})
	}

	_cacheId(id, data) {
		log.debug('caching', {id, data})
		this.services.redis.set(`character:${id}`, JSON.stringify(data), 'EX', 86400)
	}
}

module.exports = CharacterFactory