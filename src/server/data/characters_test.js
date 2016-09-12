const Redis = require('ioredis')
const redis = new Redis()
const log = new (require('../logger'))('server/data/characters_test', true)

const CharacterFactory = require('./characters')

let chars = new CharacterFactory({services:{redis}})

chars.getNameById('5428010618020694593').then(name => {
	log.debug('got char', {name})
	process.exit()
})