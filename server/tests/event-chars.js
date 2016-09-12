const Redis = require('ioredis')
const redis = new Redis()
const log = new (require('../logger'))('server/tests/event-chars', true)
const { List } = require('immutable')

const S = require('../data/dictionary')

const CharacterFactory = require('../data/characters')
const Characters = new CharacterFactory({services:{redis}})
const EventStream = require('../stats/eventStream')
//data [ Map { "world_id": "1", "zone_id": "2", "vehicle_id": "15", "event_name": "VehicleDestroy", "character_id": "5428491127574691617", "attacker_weapon_id": "6121", "timestamp": "1473510573", "facility_id": "0", "attacker_vehicle_id": "12", "attacker_character_id": "5428123302629637121", "attacker_loadout_id": "10", "faction_id": "2" } ]

let sanctioned = List([
	// Ram Kill
	'0',
	// Harasser NS Weapons
	'6100','6101','6102','6103','6104','6105','6106','6107','6108','6109','6110','6111','6112','6113','6114','6115','6116','6117','6118','6119','6120',
	// Engineer Weapons (all carbines, scout rifles, archer, pistols, and C4)
	'25008','1989','26008','1984','1994','24008','1869','7170','3','7174','1919','7171','7172','7169','7194','19000','7193','75005','802100','802102','75234','7211','7173','7214','7212','7213','44','7190','43','7191','7192','1914','20000','7215','2310','2309','2308','2317','2318','50562','432','800623','21','7403','7413','7389','7388','7412','75517','803007','7390','2','7379','801970','76358','75490','75071','75173','75171','75268','75063','803824','803825','803826','75172','75170','802733','802781','803782','804960','2001','804138','804405','804428','7414','7402','1889','1959','1954','75519','803008','7401','15','7391','7400','75521','803009','802771','802910','802921',
])

const Stream = new EventStream({world: 'Jaeger_19', eventNames: ['VehicleDestroy']})
Stream.on('VehicleDestroy', (data) => {

	// Fetch some of the more interesting values, since IDs are boring.
	processData(data).then((event) => {

		if (event.get('attacker_vehicle_id') !== '12' && event.get('attacker_vehicle_id') !== '0' ) {

		} else if (event.get('attacker_character_id') === event.get('character_id')) {
			log.info(`${event.get('attacker_character_name')} took the easy way out.`)
		} else if (!sanctioned.includes(event.get('attacker_weapon_id'))) {
			log.info(`${event.get('attacker_character_name')} used an unsanctioned weapon against ${event.get('character_name')}!`)
		} else if (event.get('attacker_weapon_id') === '0') {
			log.info(`${event.get('attacker_character_name')} flattened ${event.get('character_name')}`)
		} else {
			log.info(`${event.get('attacker_character_name')} wrecked ${event.get('character_name')}'s ${S('vehicle_id', event.get('vehicle_id'))} with wID:${event.get('attacker_weapon_id')} on a ${S('vehicle_id', event.get('attacker_vehicle_id'))} playing for ${S('faction_id', event.get('faction_id'))}`)
		}


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