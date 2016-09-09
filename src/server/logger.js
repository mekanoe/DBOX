class Logger {
	constructor(name, debug) {
		this.name = name
		this.debugOn = debug || false
	}

	error(text, ...data) {
		console.error(`ERR ${this.name}: ${text}`, data)
	}

	warn(text, ...data) {
		console.warn(`WARN ${this.name}: ${text}`, data)
	}

	notice(text, ...data) {
		console.log(`NOTICE ${this.name}: ${text}`, data)
	}

	info(text, ...data) {
		console.info(`INFO ${this.name}: ${text}`, data)
	}

	debug(text, ...data) {
		if (this.debugOn) {
			console.log(`DEBUG ${this.name}: ${text}`, data)
		}
	}

}

module.exports = Logger