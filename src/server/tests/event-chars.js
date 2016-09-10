const Redis = require('ioredis')
const redis = new Redis()
const log = new (require('../logger'))('server/tests/event-chars', true)

const CharacterFactory = require('../data/characters')
const Characters = new CharacterFactory({services:{redis}})
const EventStream = require('../stats/eventStream')

const Stream = new EventStream({world: 'Cobalt_13', eventNames: ['VehicleDestroy']})

//data [ Map { "world_id": "1", "zone_id": "2", "vehicle_id": "15", "event_name": "VehicleDestroy", "character_id": "5428491127574691617", "attacker_weapon_id": "6121", "timestamp": "1473510573", "facility_id": "0", "attacker_vehicle_id": "12", "attacker_character_id": "5428123302629637121", "attacker_loadout_id": "10", "faction_id": "2" } ]

Stream.on('VehicleDestroy', (data) => {
	
	// Fetch some of the more interesting values, since IDs are boring.
	processData(data).then((event) => {

		log.info(`${event.get('attacker_character_name')} wrecked ${event.get('character_name')}'s vID:${event.get('vehicle_id')} with wID:${event.get('attacker_weapon_id')} playing for faction ${event.get('faction_id')}`)

	})

})

function processData(data) {
	var out = data
	return new Promise((resolve, reject) => {
		
		// first, attacker char name
		Characters.getNameById(data.get('attacker_character_id')).then((name) => {
			out = out.set('attacker_character_name', name)

			// next, victim char name
			Characters.getNameById(data.get('character_id')).then((name) => {

				out = out.set('character_name', name)

				// done for now
				resolve(out)

			})

		})

	})
}