const R = require('koa-router')()

R.get('/:id', function *(next) {
	this.app.context.io.of(`/match/${this.params.id}`).emit('heartbeat', {time: Date.now()})
	let match = this.app.context.match.get(this.params.id)

	if (match === null) {
		this.status = 404
	} else {
		this.status = 200
		this.body = match
	}
})

.put('/:id', function *(next) {
	this.app.context.io.of(`/match/${this.params.id}`).emit('heartbeat', {time: Date.now()})

	this.app.context.match.start(this.params.id)
})

.post('/:id/round', function *(next) {
	this.app.context.io.of(`/match/${this.params.id}`).emit('heartbeat', {time: Date.now()})
	let data = this.request.body

	if (data.next) {

		this.app.context.match.nextRound(this.params.id)

		this.body = {'ok': true}
	}

})

.get('/:id/clock', function *(next) {
	this.app.context.io.of(`/match/${this.params.id}`).emit('heartbeat', {time: Date.now()})

	let time = this.app.context.time.get(this.params.id)

	if (time) {
		this.body = time
	} else {
		this.status = 404
	}

})

.post('/:id/clock', function *(next) {
	if (!process.env.SKIP_AUTH && this.state.auth === null) {
		this.status = 403
		this.body = { error: 'unauthorized' }
		yield next
	}

	let { redis, io } = this.app.context

	let { state } = this.request.body

	if (state === undefined) {
		this.status = 400
		this.body = { error: 'missing data' }
		yield next
	}

	if (['started', 'stopped'].indexOf(state) === -1) {
		this.status = 400
		this.body = { error: 'bad state' }
		yield next
	}

	if (state === 'started') {
		this.app.context.time.start(this.params.id)
	} else if (state === 'stopped') {
		this.app.context.time.stop(this.params.id)
	}

	this.body = { ok: true, payload: { state: state } }

})

.put('/:id/clock', function *(next) {
	this.app.context.time.reset(this.params.id)
	this.body = { ok: true }
})

module.exports = R