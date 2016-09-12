const { debug } = require('yargs').argv

// logger template//
// const log = new (require('../logger'))('server/thing')

class Logger {
	constructor(name, debugOverride = false) {
		this.name = name
		this.debugOn = (debug || process.env.DEBUG) || debugOverride
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

	request(text, ...data) {
		console.info(`HTTP   ${this.name}:\n    ${text}`)
	}

	debug(text, ...data) {
		if (this.debugOn) {
			console.log(`DEBUG  ${this.name}:\n    ${text}`, data)
		}
	}

}

module.exports = Logger