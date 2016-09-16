const log = new (require('./logger'))('server/TimeService', true)

const { Map } = require('immutable')
// clock start, set time+state in redis, send io signal
// clock running, every 5 seconds, send sync io signal
// clock stopped, set state in redis, send io signal
// clock zero, stop and return.

const ROUND_TIME = 900

class TimeService {
	constructor(svc) {
		this.svc = svc
		this.data = Map()
		this.loops = Map()
		this.__onChange = Map()
	}

	get(id) {
		return this.data.get(id)
	}

	start(id) {
		let { redis } = this.svc

		if (this.data.has(id) && this.data.get(id).state === 'started') {
			log.info('start called on started clock')
			return
		}

		let oldTime = ROUND_TIME

		if (this.data.has(id)) {
			oldTime = this.data.get(id).time
		}

		// redis.get(`clock:${id}`).then((data) => {
		// 	let oldTime = ROUND_TIME
		// 	if (data !== null) {
		// 		let d = JSON.parse(data)
		// 		if (d.state === 'started') {
		// 			log.info('start called on started clock')
		// 			return
		// 		} else {
		// 			oldTime = d.time
		// 		}
		// 	}

			this._startLoop(id)
			this._sendState(id, 'started')
			return this._setStateTime(id, {state: 'started', time: oldTime})

		//})
	}

	stop(id) {
		this._sendState(id, 'stopped')
		clearInterval(this.loops.get(id))
		this._sendSync(id, this.data.get(id).time)
		return this._setStateTime(id, {state:'stopped'})
	}

	reset(id) {
		this._sendState(id, 'stopped')
		this._sendSync(id, ROUND_TIME)
		return this._setStateTime(id, {state:'stopped', time:ROUND_TIME})
	}

	onChange(id, callback, thisArg) {
		this.__onChange = this.__onChange.set(id, {func: callback, thisArg })
	}

	_setStateTime(id, {state = null, time = null}) {
		//let { redis } = this.svc

		if (time === null) {
			time = this.data.get(id).time
		}

		if (state === null) {
			state = this.data.get(id).state
		}

		if (state !== null) {

			let oldState = null
			if (this.data.has(id)) {
				oldState = this.data.get(id).state
			}
			
			if (state !== oldState) {
				let cb = this.__onChange.get(id)
				if (cb) {
					cb.func.call(cb.thisArg, state)
				}	
			}
		}

		this.data = this.data.set(id, {state, time})
		// return redis.set(`clock:${id}`, JSON.stringify({state, time}))
	}

	_startLoop(id) {
		log.info('starting loop')
		let intv = setInterval(this._loop.bind(this, id), 1000)
		this.loops = this.loops.set(id, intv)
	}

	_sendSync(id, time) {
		log.debug('send sync for ', time)
		this.svc.io.of(`/match/${id}`).emit('event', { type: 'clock-sync', data: { time } })
	}

	_sendState(id, state) {
		log.debug('send state for ', state)
		this.svc.io.of(`/match/${id}`).emit('event', { type: 'clock-state', data: { state } })
	}

	_loop(id) {
		let { time, state } = this.data.get(id)

		if (state === 'stopped') {
			return
		}
		
		let newTime = time - 1 
		let sendSync = newTime % 5 === 0

		this._setStateTime(id, { time: newTime })
		this.data.set(id, { state, time: newTime })

		if (sendSync) {
			this._sendSync(id, newTime)
		}

		if (newTime <= 0) {
			this._setStateTime(id, { state: 'stopped' })
			this._sendSync(id, newTime)
			this.stop(id)
		}
	}

}

module.exports = TimeService