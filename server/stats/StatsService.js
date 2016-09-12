const log = new (require('../logger'))('server/stats/StatsService')

const uuid = require('node-uuid')
const EventStream = require('./eventStream')
const { Map } = require('immutable')

class StatsService {
	constructor() {
		this.__streams = Map()
	}

	createStream(eventStreamOpts) {
		let stream = new EventStream(eventStreamOpts)
		let id = uuid.v4()

		this.__streams = this.__streams.set(id, stream)
		return {id, stream}
	}

	getStreams() {
		return this.__streams
	}

	stopStream(id) {
		let stream = this.__streams.get(id)
		if (stream === undefined) {
			return true
		}

		stream.stop()
		this.__streams = this.__streams.delete(id)
		return true
	}
}

module.exports = StatsService