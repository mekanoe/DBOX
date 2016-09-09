const ws = require('ws')
const { Map, Set } = require('immutable')

// const c = require('../conf')

const log = new (require('../logger'))('server/stats/eventSocket', true)

////
// An EventSocket is a websocket client for the PS2 live event stream API.
// Docs: http://census.daybreakgames.com/#what-is-websocket
// 
// This includes a simple eventemitter.
//
// Arguments
//   config obj{eventNames: []str{'VehicleDestroy','PlayerLogin','PlayerLogout'}, worlds: []str{'19'}}
class EventSocket {
	constructor(config) {
		// Subscribe to these relevant events on these relevant worlds.
		this.eventNames = config.eventNames || ['VehicleDestroy','PlayerLogin','PlayerLogout']
		this.worlds = config.worlds || ['19'] // 19 == Jaeger
		
		// Private attributes for the event emitter
		this.__on = Set()
		this.__onAll = Set()
		this.__onHeartbeat = Set()

		// Public listening state
		this.listening = false

		// Socket attribute
		this.socket = this._connect()
	}


	////
	// @internal
	// Connects to the websocket and does the basic hooking for the event emitter.
	// 
	// Returns WebSocket client.
	_connect() {
		let w = new ws(`wss://push.planetside2.com/streaming?environment=ps2&service-id=s:PomfDBOX`)

		log.notice('connected to event socket')

		w.on('message', (data) => {
			let d = JSON.parse(data)

			log.debug('got message', d)

			if (d.type === "heartbeat") {
				log.debug('got heartbeat')
				this._triggerHeartbeat(d)
			} else if(d.type == "serviceMessage") {
				log.debug('got serviceMessage', d.payload.event_name)
				this._triggerAll(d.payload)
				this._triggerOn(d.payload.event_name, d.payload)
			} else {
				log.notice('got odd message', d)
			}
		})

		w.on('close', () => {
			this._socketClosed()
			log.warning('socket closed')
			this.listening = false
		})

		return w
	}


	////
	// Sends the initial event subscription.
	//
	// If the socket isn't ready, this call will be deferred until it is open.
	// If the socket is closed, this will throw.
	startListening() {
		let send = () => {
			this.socket.send(JSON.stringify({
				"service":"event",
				"action":"subscribe",
				"characters":["all"],
				"worlds":this.worlds,
				"eventNames":this.eventNames
			}))
			log.notice('listen started')
			this.listening = true
		}

		switch(this.socket.readyState) {
			case ws.OPEN: send(); break
			case ws.CLOSED: log.fatal('cannot listen to a closed socket'); break
			default:
				log.notice('listen start deferred')
				this.socket.on('open', () => {
					send()
				})
		}

	}


	////
	// Sends the unsubscribe frame to the API.
	// Useful for temporary halts, or idling.
	stopListening() {
		this.socket.send(JSON.stringify({"service":"event","action":"clearSubscribe","all":"true"}))
		log.notice('listen stopped')
		this.listening = false
	}


	////
	// Adds a listener to every serviceMessage event
	//
	// Arguments
	//   callback func(obj{})
	onAll(callback) {
		this.__onAll = this.__onAll.add(callback)
	}


	////
	// Adds a listener to the event emitter
	//
	// Arguments
	//	 eventName string
	//   callback  func(obj{})
	on(eventName, callback) {
		this.__on = this.__on.add({eventName, callback})
	}


	////
	// Adds a listener for heartbeat events.
	// Useful for socket watchdogging.
	//
	// Arguments
	//   callback func(obj{})
	onHeartbeat(callback) {
		this.__onHeartbeat = this.__onHeartbeat.add(callback)
	}


	////
	// @internal
	// Fires event handlers for a generic Set without the event discriminator.
	// Used for _triggerHeartbeat and _triggerAll
	//
	// Arguments
	//   handlers Set([]func(obj{}))
	//   data     obj{}
	_triggerGenericOn(handlers, data) {
		handlers.forEach((v) => {
			v(data)
		})
	}


	////
	// @internal
	// Triggers serviceMessage event handlers that are discriminated per event type.
	//
	// Arguments
	//   eventName string
	//   data      obj{}
	_triggerOn(eventName, data) {
		this.__on.forEach((v) => {
			if (v.eventName === eventName) {
				v.callback(data)
			}	
		})
	}


	////
	// @internal
	// Triggers all serviceMessage event handlers via generic
	//
	// Arguments
	//	 data obj{}
	_triggerAll(data) {
		this._triggerGenericOn(this.__onAll, data)
	}


	////
	// @internal
	// Triggers heartbeat event handlers via generic
	//
	// Arguments
	//	 data obj{}
	_triggerHeartbeat(data) {
		this._triggerGenericOn(this.__onHeartbeat, data)
	}
}

module.exports = EventSocket