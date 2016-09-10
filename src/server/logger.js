const { debug } = require('yargs').argv

class Logger {
	constructor(name, debugOverride = false) {
		this.name = name
		this.debugOn = debug || debugOverride
	}

	fatal(text, ...data) {
		this.error(text, data)
		throw text
	}

	error(text, ...data) {
		console.error(`ERR    ${this.name}:\n    ${text}`, data)
	}

	warn(text, ...data) {
		console.warn(`WARN   ${this.name}:\n    ${text}`, data)
	}

	notice(text, ...data) {
		console.log(`NOTICE ${this.name}:\n    ${text}`, data)
	}

	info(text, ...data) {
		console.info(`INFO   ${this.name}:\n    ${text}`, data)
	}

	debug(text, ...data) {
		if (this.debugOn) {
			console.log(`DEBUG  ${this.name}:\n    ${text}`, data)
		}
	}

}

module.exports = Logger