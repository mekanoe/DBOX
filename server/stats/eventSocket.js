const ws = require('ws')
const EventEmitter = require('eventemitter3')
const { Map } = require('immutable')

// const c = require('../conf')

const log = new (require('../logger'))('server/stats/eventSocket')

////
// An EventSocket is a websocket client for the PS2 live event stream API.
// Docs: http://census.daybreakgames.com/#what-is-websocket
// 
// This includes a simple eventemitter.
//
// Arguments
//   config obj{eventNames: []str{'VehicleDestroy','PlayerLogin','PlayerLogout'}, worlds: []str{'19'}}
class EventSocket extends EventEmitter {
	constructor(config) {
		super()

		// Subscribe to these relevant events on these relevant worlds.
		this.eventNames = config.eventNames || ['VehicleDestroy','PlayerLogin','PlayerLogout']
		this.worlds = config.worlds || ['19'] // 19 == Jaeger

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
		let w = new ws(`wss://push.planetside2.com/streaming?environment=ps2&service-id=s:${process.env.SERVICE_ID}`)

		log.notice('connected to event socket')

		w.on('message', (data) => {
			let d = JSON.parse(data)

			log.debug('got message', d)

			if (d.type === "heartbeat") {
				log.debug('got heartbeat')
				this.emit('heartbeat',d)
			} else if(d.type == "serviceMessage") {
				log.debug('got serviceMessage', d.payload.event_name)
				this.emit('serviceMessage', Map(d.payload))
				this.emit(d.payload.event_name, Map(d.payload))
			} else {
				log.notice('got odd message', d)
				this.emit(d.type, d)
			}
		})

		w.on('close', () => {
			this.emit('closed')
			log.warn('socket closed')
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
			let payload = JSON.stringify({
				service: 'event',
				action: 'subscribe',
				characters: ['all'],
				worlds: this.worlds,
				eventNames: this.eventNames
			})

			log.debug('sending payload', payload)

			this.socket.send(payload)
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

		this.emit('listen-start')

	}


	////
	// Sends the unsubscribe frame to the API.
	// Useful for temporary halts, or idling.
	stopListening() {
		if(this.socket.readyState < ws.CLOSING) {
			this.socket.send(JSON.stringify({
				service: 'event',
				action: 'clearSubscribe',
				all: 'true'
			}))
		} 
		log.notice('listen stopped')
		this.listening = false
		this.emit('listen-stop')
	}
}

module.exports = EventSocket