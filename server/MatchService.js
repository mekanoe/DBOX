const log = new (require('./logger'))('server/MatchService', true)

const { Map, List } = require('immutable')

const SANCTIONED = List([
	// Ram Kill
	'0',
	// Engineer Weapons (all carbines, scout rifles, archer, pistols, and C4)
	'25008','1989','26008','1984','1994','24008','1869','7170','3','7174','1919','7171','7172','7169','7194','19000','7193','75005','802100','802102','75234','7211','7173','7214','7212','7213','44','7190','43','7191','7192','1914','20000','7215','2310','2309','2308','2317','2318','50562','432','800623','21','7403','7413','7389','7388','7412','75517','803007','7390','2','7379','801970','76358','75490','75071','75173','75171','75268','75063','803824','803825','803826','75172','75170','802733','802781','803782','804960','2001','804138','804405','804428','7414','7402','1889','1959','1954','75519','803008','7401','15','7391','7400','75521','803009','802771','802910','802921',
	// Shotguns
	'40000', '30', '1939', '41002', '39000', '40001', '1934', '40002', '128', '7423', '129', '75083', '802322', '1097', '1849', '41000', '41001', '39002', '7441', '1884', '39001', '7432'
])

const SANCTIONED_PER_ROUND = {
	1: List([ 
		// Harasser ES AI
		'6124', '6122', '6125',
		// Harasser ESCRAV
		'802900','6121','802898',
		// Basilisk-H, Kobalt-H, Fury-H, and Bulldog-
		'6103', '6104', '6105',	'6100', '6101', '6102',	'6115', '6116', '6117',	'6112', '6113', '6114',
	]),

	2: List([
		// Harasser ESLRAV
		'802875', '6123', '6126',
		// Halberd - H, Basilisk -H, Kobalt-H, Walker-H
		'6118', '6119', '6120',
		'6103', '6104', '6105',
		'6100', '6101', '6102',
		'6106', '6107', '6108',
	]),

	3: List([
		// NS Only
		'6100','6101','6102','6103','6104','6105','6106','6107','6108','6109','6110','6111','6112','6113','6114','6115','6116','6117','6118','6119','6120',
	])
}

class MatchService {
	constructor(svc) {
		this.svc = svc
		this.matches = Map()
	}

	start(id, opts = { world: process.env.WORLD_ID }) {
		log.notice('started match', id)

		let { r, redis, time, stats, io, chars } = this.svc

		time.onChange(id, (state) => {
			log.debug('clock state changed', state)
			let match = this.matches.get(id)
			match.clockState = state
			this.matches = this.matches.set(id, match)
		}, this)

		let { _, stream } = stats.createStream(opts)

		this.matches = this.matches.set(id, {
			stream,
			currentRound: 1,
			clockState: 'stopped',
			rounds: [{
				scores: {
					1: 0,
					2: 0,
					3: 0
				}
			}],
			wins: {
				1: 0,
				2: 0,
				3: 0,
			},
			overallScores: {
				1: 0,
				2: 0,
				3: 0,
			}
		})

		stream.on('VehicleDestroy', (data) => {
			log.debug('vd data', data)
			chars.injectVehicleDestroyEvent(data).then((event) => {
				let scoreEvent = this._isScoreEvent(id, event)
				io.of(`/match/${id}`).emit('event', { type: 'VehicleDestroy', data: { event, scoreEvent } })
				let faction = event.get('attacker_faction_id')

				if (scoreEvent === true) {
					io.of(`/match/${id}`).emit('event', { type: 'score', data: {faction: faction} })
					
					let match = this.matches.get(id)
					match.overallScores[faction] = match.overallScores[faction] + 1
					match.rounds[match.currentRound - 1].scores[faction] = match.rounds[match.currentRound - 1].scores[faction] + 1
					this.matches = this.matches.set(id, match)
				}
				
				r.table('events').insert({ scoreEvent, event: data.toJS(), faction: faction, matchID: id, round: this.matches.get(id).currentRound }).run().then((d) => {
					log.debug('event insert', d)
				}).catch((err) => {
					log.error('event insert failed', err)
				})

			}).catch((err) => {
				log.error('inject vd event error', err)
			})

		})

		stream.on('PlayerLogin', (data) => {
			io.of(`/match/${id}`).emit('event-raw', { type: 'PlayerLogin', data })
			r.table('events').insert([data])
		})

		stream.on('PlayerLogout', (data) => {
			io.of(`/match/${id}`).emit('event-raw', { type: 'PlayerLogout', data })
			r.table('events').insert([data])
		})

	}

	stop(id) {

	}

	nextRound(id) {
		let match = this.matches.get(id)
		match.rounds.push({scores: {1: 0,2: 0,3: 0}})
		match.currentRound = match.currentRound + 1
		this.matches = this.matches.set(id, match)
		this.svc.time.reset(id)
		this.svc.io.of(`/match/${id}`).emit('event', { type: 'round-change', data: { round: match.currentRound } })
		this.svc.r.table('events').insert({ round: match.currentRound, event: { type: 'roundChange', end: Math.floor(Date.now()/100) }}).run()
	}

	get(id) {
		if (!this.matches.has(id)) {
			return null
		}
		let safeMatch = this.matches.get(id)
		delete safeMatch.stream
		return safeMatch
	}

	_isScoreEvent(id, data) {
		let match = this.matches.get(id) 
		if ( match.clockState === 'stopped' ) {
			log.debug('score event false: clocked stopped')
			return false
		}

		if ( data.get('attacker_faction_id') === data.get('faction_id') ) {
			log.debug('score event false: teamkill/suicide')
			return false
		}

		if ( !SANCTIONED.includes(data.get('attacker_weapon_id')) 
			&& !SANCTIONED_PER_ROUND[match.currentRound].includes(data.get('attacker_weapon_id')) ) {
			log.debug('score event false: unsanctioned', data.get('attacker_weapon_id'))
			return false
		}

		return true
	}

}

module.exports = MatchService