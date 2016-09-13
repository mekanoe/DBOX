const log = new (require('../logger'))('server/pages/auth')
const R = require('koa-router')()

R.get('/:token', function *(next) {
	let auth = this.app.context.auth

	yield auth.verifyToken(this.params.token).then((tokenData) => {
		auth.setCookie(tokenData, this)
		log.info('token login', { token: this.params.token, event: tokenData.eventID })
		this.res.redirect(`/event/${tokenData.eventID}`)
	}).catch((d) => {
		log.warn('token rejected', { token: this.params.token, err: d })
		this.status = 404
	})
})

module.exports = R