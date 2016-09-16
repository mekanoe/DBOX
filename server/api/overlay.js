const log = new (require('../logger'))('server/api/overlay')

const R = require('koa-router')()
module.exports = R

R.patch('/:id', function *(next) {
	let redis = this.app.context.redis

	if (!process.env.SKIP_AUTH && this.state.auth === null) {
		log.warn('no auth')
		this.status = 403
		this.body = { error: 'unauthorized' }
		return
	}

	if (Object.keys(this.request.body).length === 0 && this.request.body.constructor === Object) {
		log.warn('no data')
		this.status = 400
		this.body = { error: 'missing data' }
	}

	yield redis.get(`overlay:${this.params.id}`).then((overlay) => {
		if (overlay === null) {
			this.status = 404
			this.body = { error: 'overlay not found' }
			return
		}

		overlay = JSON.parse(overlay)

		if (!process.env.SKIP_AUTH && (!this.state.auth.mode === 'user' || overlay.ownerID !== this.state.auth.data.id)) {
			log.warn('bad auth')
			this.status = 403
			this.body = { error: 'unauthorized' }
			return
		}

		let newOverlay = Object.assign({}, overlay, this.request.body)
		redis.set(`overlay:${this.params.id}`, JSON.stringify(newOverlay))

		this.body = { ok: true, payload: newOverlay }
		return
	})

})	