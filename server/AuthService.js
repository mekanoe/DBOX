const log = new (require('./logger'))('server/AuthService')
const crypto = require('crypto')

const uuid = require('node-uuid')
const jwt = require('jsonwebtoken')

////

class AuthService {
	constructor(svc) {
		this.svc = svc
	}

	verifyToken(token) {
		let r = this.svc.r

		return new Promise((resolve, reject) => {
		
			// Token will always be 48 in length.
			if (token.length !== 48) {
				return reject('too_short')
			}

			let id = new Buffer(token, 'base64').toString('ascii')
			
			r.table('auth_keys').get(id).run().then((data) => {
				if (data === null) {
					return reject('not_exists')
				}

				resolve(data)
			})

		})
	}

	setCookie({ id }, ctx) {
		let redis = this.svc.redis
		
		let sessionID = uuid.v4()

		let token = jwt.sign(sessionID, process.env.SECURE_KEY)

		redis.set(`token-jwt:${sessionID}`, JSON.stringify({ id, matchID }))
		ctx.cookies.set('dbox_auth', `t$${token}`, {
			httpOnly: true,
			secure: true,
			domain: process.env.COOKIE_DOMAIN || this.req.header.host
		})
	}

	cookieMiddleware() {
		return function *(next){
			let cookie = this.cookies.get('dbox_auth')

			if (!cookie) {
				this.state.auth = null
				yield next
				return
			}

			yield this.app.context.auth.verifyCookie(cookie).then((data) => {
				this.state.auth = data
				return next
			})
		}
	}

	csrfMiddleware() {
		return function *(next){

			// if method is idempotent, skip
			if ( ['GET', 'HEAD', 'OPTIONS'].indexOf(this.method) !== -1) {
				yield next
			} else {

				let csrf = this.req.headers['csrf-token']
				log.info('headers', this.req.headers)
				let expected = ''

				if (csrf !== undefined) {

					let hash = crypto.createHash('sha384')
					hash.update(JSON.stringify([process.env.CSRF_KEY,this.method,this.url]))
					expected = hash.digest('base64')

					if (csrf === expected) {
						yield next
					}

				}

				log.warn('csrf_failed', {
					url: this.url,
					method: this.method,
					got: csrf,
					expected: expected
				})

				if (process.env.CSRF_BYPASS) {
					yield next
				} else {
					this.status = 403
					this.body = { error: 'csrf_failed' }
					return				
				}
			}
		}
	}

	verifyCookie(cookie) {
		switch(cookie[0]) {
			case 't': return this._verifyToken(cookie.substr(2))
			case 'u': return this._verifyUser(cookie.substr(2))
			default: 
				return false
		}
	}

	_verifyUser(token) {
		return new Promise((resolve, reject) => {
			return reject('not_implemented')
		})
	}

	_verifyToken(token) {
		return new Promise((resolve, reject) => {

			let data = jwt.verify(token, process.env.SECURE_KEY, { ignoreExpiration: true })
			redis.get(`token-jwt:${data}`).then((data) => {
				if (data === null) {
					return reject('not_found')
				}

				return resolve({mode: 'token', data: JSON.parse(data)})
			})

		})
	}

}

module.exports = AuthService