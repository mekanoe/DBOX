const EventEmitter = require('eventemitter3')
const log = new (require('../logger'))('server/stats/eventStream', true)
const { Map } = require('immutable')

const EventAPI = require('./eventApi')
const EventSocket = require('./eventSocket')
const EventSocketWatchdog = require('./eventSocketWatchdog')

////
// EventStream aggregates the EventSocket and EventAPI systems into a common EventEmitter.
// This also mounts a watchdog to the EventSocket so you don't have to.
// Currently, this class isn't portable. You'll want to make some changes to get this to work
// outside of VehicleDestroy and PlayerLogin|out events.
//
// Arguments
//   anon obj{initialMode str{socket}, vehicleId str{12}, world str{Jaeger_19},
//			  eventNames []str{VehicleDestroy,PlayerLogin,PlayerLogout}}
class EventStream extends EventEmitter {
	constructor({ initialMode = 'socket', vehicleId = '12', world = 'Jaeger_19', eventNames }) {
		super()

		// Default attribute things
		eventNames = eventNames || ['VehicleDestroy', 'PlayerLogin', 'PlayerLogout']
		let worldId = world.split('_')[1]
		this.filterData = { vehicleId, worldId, eventNames, world }

		// Exposed for event debugging
		this.socket = null
		this.socketWatchdog = null
		this.poller = null

		// Keep track of the last event so we can fallback if we lose the socket.
		this.__lastEvent = new Date()

		// Aaaand initialize.
		this.mode = null
		this._start(initialMode)
	}


	////
	// @internal
	// Decides data source the stream takes from.
	//
	// Arguments
	//   initialMode str
	_start(initialMode) {
		switch(initialMode) {
			case 'socket':
				this._startSocket()
				break;
			case 'polling':
				this._startPolling()
				break;
			default:
				log.error(`i don't know what '${initialMode}' is.`)
		}
	}


	////
	// @internal
	// Moves through data sources in a cascading format, stops at the end.
	// The general order:
	//   stream -> polling
	//  polling -> stopped
	//        * -> stopped
	_fallback() {
		this._stopCurrent()
		switch(this.mode) {
			case 'socket': this._startPolling(); break
			default:
				log.error(`can't fallback from ${this.mode}, changing to 'stopped'`)
				this.mode = 'stopped'
		}
	}


	////
	// Switch modes by stopping any currently running and starting the specified one.
	// 
	// Arguments
	//   mode str
	switchMode(mode) {
		this._stopCurrent()
		this._start(mode)
	}


	////
	// @internal
	// Calls the stop method for the current data source.
	_stopCurrent() {
		switch(this.mode) {
			case 'socket': this._stopSocket(); break
			case 'polling': this._stopPolling(); break
		}
	}


	////
	// @internal
	// Starts the socket data source.
	_startSocket() {

		this.mode = 'socket'

		// Make the socket
		this.socket = new EventSocket({ eventNames: this.filterData.eventNames, worlds: [this.filterData.worldId] })
		this.socketWatchdog = new EventSocketWatchdog(this.socket, { heartbeatWorld: this.filterData.world })

		// Mount events
		this.socketWatchdog.on('panic', (reason) => {
			log.error(`watchdog panicked: ${reason}`)
			this._fallback()
		})
		this.socketWatchdog.on('fatal', () => {
			log.error('watchdog fatalled')
			this._fallback()
		})

		this.socket.on('VehicleDestroy', (data) => {
			if (this._checkAcceptable(data)) {
				this._setLastEvent(data.get('timestamp'))
				this.emit('VehicleDestroy', data)
			} else {
				//log.debug('data was rejected', { vid: data.vehicle_id, wid: data.world_id })
			}
		})

		this.socket.on('PlayerLogin', (data) => {
			//this.playerStream.push({state: 'login', data})
		})

		this.socket.on('PlayerLogout', (data) => {
			//this.playerStream.push({state: 'logout', data})
		})

		// Start listening to the socket...
		log.debug('starting socket')
		this.socketWatchdog.start()
		this.socket.startListening()
	}


	////
	// @internal
	// Stops the watchdog, unsubs from the socket, and closes it.
	_stopSocket() {
		this.socketWatchdog.stop()
		this.socket.stopListening()
		this.socket.socket.close()
		log.debug('stopped socket')
	}


	////
	// @internal
	// Starts the polling data source.
	_startPolling() {
		const api = new EventAPI({worlds: [this.filterData.worldId]})

		// initial run
		log.debug('trying to catch up...')
		api.pollVKills.apply(api, [Math.floor(this.__lastEvent/1000)]).then((data) => {
			this._unpackAPIData(data, 'VehicleDestroy')
			log.debug('unpacked api catchup data')
		}).catch((err) => {
			log.error('promise error', err)
		})

		// actual polling
		this.poller = api.polling(api.pollVKills, 1, (data, empty) => {
			this._unpackAPIData(data, 'VehicleDestroy')
		})

		log.debug('started polling')

	}


	////
	// @internal
	// Tells the poller to stop.
	_stopPolling() {
		this.mode = 'stopped'
		this.poller.stop()
		log.debug('stopped polling')
	}


	////
	// @internal
	// Unpacks Immutable#iterable-formatted data, usually from the API.
	// The emitAs argument is the event each entry will emit.
	//
	// Arguments
	//   data   Immutable#iterable
	//   emitAs str
	_unpackAPIData(data, emitAs) {
		if (data.size === 0) {
			// nothing to do
			log.debug('unpacking, had nothing')
			return
		}

		data = data.filter(v => v.attacker_vehicle_id === this.filterData.vehicleId && v.world_id === this.filterData.worldId)

		if (data.size === 0) {
			// nothing to do
			log.debug('unpacking, had nothing after filter')
			return
		}

		data.forEach((v) => {
			this.emit(emitAs, Map(v))
		})
	}


	////
	// @internal
	// Filter single datasets, used here for filtering socket data.
	//
	// Arguments
	//   data Immutable#Map
	// Returns bool
	_checkAcceptable(data) {
		return (data.get('attacker_vehicle_id') === this.filterData.vehicleId && data.get('world_id') === this.filterData.worldId)
	}


	////
	// @internal
	// Sets the last event from the socket for fallback methods to catch up where things broke.
	_setLastEvent(timestamp) {
		let t = new Date(timestamp * 1000)
		if (t > this.__lastEvent) {
			this.__lastEvent = t
			log.debug('new last event time', {timestamp})
		}
	}
}

module.exports = EventStream