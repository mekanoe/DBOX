const EventEmitter = require('eventemitter3')
const log = new (require('../logger'))('server/stats/eventSocketWatchdog', true)

////
// This is a helper class for EventStream to properly watchdog EventSocket heartbeats,
// and panic if things start to go wrong.
// Note that this won't panic immediately. It will try to give it a few failures headroom.
//
// States
//   - WAITING (0) - not monitoring, will not fire hooks
//   - WATCHING (1) - monitoring, will fire hooks
//   - PANIC (2) - monitoring, alert mode, watchdog isn't getting heartbeats from server
//   - FATAL (3) - not monitoring, alert mode, socket has closed
// Arguments
//	 eventSocket EventSocket
//	 anon 		 obj{panicTimeout int{31000}, checkInterval int{1000}, 
//                   threshold int{2}, heartbeatWorld str{'Jaeger_19'}}
class EventSocketWatchdog {
	constructor(eventSocket, { panicTimeout = 31000, checkInterval = 1000, 
							   threshold = 2, heartbeatWorld = 'Jaeger_19' }) {
		this.eventSocket = eventSocket 		   // The socket we're watching
		this.panicTimeout = panicTimeout	   // The time in ms before the watchdog should panic
		this.checkInterval = checkInterval	   // The time in ms to run watchdog checks
		this.threshold = threshold			   // The amount of times we panic before confirming it's a panic.
		this.heartbeatWorld = heartbeatWorld   // The world we care about in heartbeats. All others we don't care about.
											   // This is set to Jaeger by default. Format is Servername_WorldID, e.g. Jaeger_19

		EventEmitter.call(this)

		// Set state constants
		['WAITING', 'WATCHING', 'PANIC', 'FATAL'].forEach((v, i) => { this[v]=i })

		// See class docstring for this
		this.state = this.WAITING

		// Mount heartbeat and close handlers
		eventSocket.on('heartbeat', this.handleHeartbeat)
		eventSocket.on('close', this.handleClose)

		// Some instance helper vars
		this.__setDefaults()
	}


	////
	// @private
	// Sets default attributes.
	__setDefaults() {
		this.__lastHeartbeat = null			// Last heartbeat Date()
		this.__lastPanicCounterSeen = 0		// Counter reset value.
		this.__panicCheckIntv = null		// Panic reset interval
		this.__panicCounter = 0				// Panic counter for threshold.
		this.__panicReason = null			// Last reason for panicing.
		this.__socketClosed = null			// Is socket closed? null or false is a good value.
		this.__watchdogCheckIntv = null		// Watchdog interval
		this.__watchdogStartTime = null		// Watchdog start Date(), used for setup checks
	}


	////
	// @internal
	// Smoke-checks the underlying socket for a good state.
	_earlySetup() {
		// Check if the socket's readyState is CLOSING (2) or CLOSED (3)
		if (this.eventSocket.socket.readyState >= 2) {
			this.__socketClosed = true
		}
	}


	////
	// Starts the watchdog.
	start() {
		this.state = this.WATCHING

		this._earlySetup()
		this.__watchdogStartTime = new Date()
		this.__watchdogCheckIntv = setInterval(this._watchdogCheck, this.checkInterval)
		this.__panicCheckIntv = setInterval(this._panicCheck, this.panicTimeout - this.checkInterval)
	}


	////
	// Stops the watchdog, and resets it's state.
	stop() {
		this.state = this.WAITING
		if (this.__watchdogCheckIntv !== null) {
			clearInterval(this.__watchdogCheckIntv)
		}
		if (this.__panicCheckIntv !== null) {
			clearInterval(this.__panicCheckIntv)
		}

		this.__setDefaults()
	}


	////
	// @internal
	// Watchdog runner. Fatals if socket is closed. Panics if successful heartbeat was too far away.
	_watchdogCheck() {

		// Simplest watchdog step. Socket will not be closed, watchdog here.
		// This won't panic, it only fatals.
		if (this.__socketClosed === true) {
			this._fatal()
			return
		}
		
		// In setup mode, the last heartbeat won't be available and the socket won't be closed.
		if (this.__lastHeartbeat === null && this.__socketClosed !== true) {
			
			// We want to make sure we don't stay in setup mode forever, watchdog here.
			if (this.__watchdogStartTime + this.panicTimeout > Date.now()) {
				
				// Timeout is still in the future, return.
				return

			} else {

				// Timeout is in the past, we have to panic here.
				this._panic('SETUP_TIMEOUT')
				return

			}

		}

		// Heartbeat is set so we aren't in setup mode anymore.
		// That heartbeat should have been within panicTimeout of now, watchdog here.
		if (this.__lastHeartbeat !== null) {

			if (this.__lastHeartbeat + this.panicTimeout < Date.now()) {

				this._panic('HEARTBEAT_TIMEOUT')
				return

			}

		}

	}


	////
	// @internal
	// General panic check, will reset the counter if it hasn't changed in a while.
	_panicCheck() {
		if (this.__lastPanicCounterSeen === this.__panicCounter) {
			this.__panicCounter = 0
			log.debug('panic counter reset')
		}

		this.__lastPanicCounterSeen = this.__panicCounter
	}


	////
	// Handles heartbeat events from the eventSocket
	//
	// Arguments
	//	 d obj{online obj[string]string{}}
	handleHeartbeat(d) {
		if (d.online[`EventServerEndpoint_${this.heartbeatWorld}`] === undefined) {
			log.panic('heartbeat lacks watchdog server in payload')
		} else {
			if (d.online[`EventServerEndpoint_${this.heartbeatWorld}`] === "true") {
				// Heartbeat has given us good data, let's do it!
				this.__lastHeartbeat = new Date()
			} else {
				// If this heartbeat is actually false, it's not data we care about.
				// We just log and move on.
				log.warning('heartbeat untrue', d.online)
			}
		}
	}


	////
	// Handles closed events from eventSocket
	handleClose() {
		this.__socketClosed = true
	}


	////
	// @internal
	// Report a panic. Unless the counter isn't beyond the threshold, this just counts.
	//
	// Arguments
	//   reason str{}
	_panic(reason) {
		if(this.__panicCounter >= this.threshold) {
			log.warning('panic threshold reached', reason)
			this.__panicReason = reason
			this.emit('panic', reason)
		}

		log.debug('panic', reason)
		this.__panicCounter = this.__panicCounter++
	}


	////
	// @internal
	// Report that the socket has died. We can't do anything else.
	_fatal() {
		log.warning('watchdog fatalled')
		this.stop()
		this.emit('fatal')
	}


}

module.exports = EventSocketWatchdog