const Redis = require('ioredis')
const redis = new Redis()
const log = new (require('../logger'))('server/data/characters_test', true)

const CharacterFactory = require('./characters')

let chars = new CharacterFactory({services:{redis}})

chars.byID('5428010618020694593').then(char => {
	log.debug('got char', {char.name.first})
	process.exit()
})