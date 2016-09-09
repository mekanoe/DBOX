const ws = require('ws')
const Map = require('immutable').Map
const Set = require('immutable').Set

// const c = require('../conf')

const log = new (require('../logger'))('server/stats/eventSocket', true)

class StatsSocket {
	constructor(config) {
		this.eventNames = config.eventNames || ['VehicleDestroy','PlayerLogin','PlayerLogout']
		this.worlds = config.worlds || ['19'] // 19 == Jaeger
		
		this.__on = Set()
		this.__onAll = Set()
		this.__onHeartbeat = Set()

		this.listening = false

		this.socket = this._connect()
	}

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

		if (this.socket.readyState !== ws.OPEN) {
			log.notice('listen start deferred')
			this.socket.on('open', () => {
				send()
			})
		} else {
			send()
		}

	}


	stopListening() {
		this.socket.send(JSON.stringify({"service":"event","action":"clearSubscribe","all":"true"}))
		log.notice('listen stopped')
		this.listening = false
	}


	onAll(callback) {
		this.__onAll = this.__onAll.add(callback)
	}

	on(eventName, callback) {
		this.__on = this.__on.add({eventName, callback})
	}

	onHeartbeat(callback) {
		this.__onHeartbeat = this.__onHeartbeat.add(callback)
	}

	_triggerGenericOn(handlers, data) {
		handlers.forEach((v) => {
			v(data)
		})
	}

	_triggerOn(eventName, data) {
		this.__on.forEach((v) => {
			if (v.eventName === eventName) {
				v.callback(data)
			}	
		})
	}

	_triggerAll(data) {
		this._triggerGenericOn(this.__onAll, data)
	}

	_triggerHeartbeat(data) {
		this._triggerGenericOn(this.__onHeartbeat, data)
	}
}

module.exports = StatsSocket