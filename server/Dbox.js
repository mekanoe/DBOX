const log = new (require('./logger'))('server/Dbox')
const cofs = require('co-fs')
const fs = require('fs')


////
// Dbox is the core server controller. It mounts data services, real-time, and provides API handlers.
// This is the glue.
// 
// Arguments
//   router   KoaRouter#Router
//   io       SocketIO#Server
//   ctx      Koa#AppContext
class Dbox {
	constructor(router, io, ctx) {
		this.router = router
		this.io = io
		this.ctx = ctx

		// Give API access to the websocket
		ctx.io = io

		// Some warning logs
		if (process.env.DEBUG) log.warn('debug mode is on')
		if (process.env.SKIP_AUTH) log.warn('SECURITY WARNING: auth is being bypassed')

		this._mountServices()
		this._mountRoutes()
	}


	////
	// @internal
	// Mount the data services to the Koa context
	_mountServices() {
		this.ctx.redis = new (require('ioredis'))({
			port: process.env.REDIS_PORT || '6379',
			host: process.env.REDIS_HOST || 'localhost',
			parser: 'hiredis',
			dropBufferSupport: true,
			enableReadyCheck: true,
			enableOfflineQueue: true
		})

		this.ctx.r = new (require('rethinkdbdash'))({
			db: 'dbox',
			host: process.env.RETHINK_HOST || 'localhost',
			port: process.env.RETHINK_PORT || 28015,
			buffer: 300,
    		max: 3000,
    		silent: true,
		})
		
		this.ctx.stats = new (require('./stats/StatsService'))(this.ctx)
		this.ctx.auth = new (require('./AuthService'))(this.ctx)
		this.ctx.time = new (require('./TimeService'))(this.ctx)
		this.ctx.chars = new (require('./data/Character'))(this.ctx)
		this.ctx.match = new (require('./MatchService'))(this.ctx)
	}


	////
	// @internal
	// Mount the routes! Makes heavy use of Dbox#_route.
	_mountRoutes() {

		// Mount middleware
		this.router.use(this.ctx.auth.cookieMiddleware())
		//this.router.use(this.ctx.auth.csrfMiddleware())

		// Only mount test routes in development.
		if (process.env.NODE_ENV === 'development') this._route('./api/test')

		// API
		this._route('./api/streams')
		this._route('./api/match')
		this._route('./api/overlay')

		// Pages
		this._route('./pages/overlay', '/o')
		this._route('./pages/auth', '/~')

		// Default to panel if nothing else captured...
		this._route('./pages/panel', '/')

		// And serve ^this for 404 as well
		this.router.use(function *notFound(next){
			yield next

			if (this.status !== 404) {
				return
			}

			if (this.url.startsWith('/api')) {
				if (this.body === undefined) this.body = {error: 'not found'}
			} else {
				this.body = yield cofs.readFile(fs.realpathSync('dist/frontend/panel.html'), 'utf8')
				this.status = 404
			}

			
		})

	}


	////
	// @internal
	// This is a sugar method so we don't have to keep vars in our route mounter.
	// If you don't pass a prefix, it'll try to figure it out via the module path.
	// This lets you put your routes canonical to their URL, e.g. /api/users can sit at ./api/users.js
	// If something goes wrong during import, e.g. bad path or syntax, a fallback will prevent 
	// one bad route smashing the entire server.
	//
	// Arguments
	//   modulePath str
	//   prefix     str?{<null>}
	_route(modulePath, prefix = null) {
		let module = null
		try {
			module = require(modulePath)
			if (prefix === null) {
				// So we weren't given a prefix, so we did some canonical magic. Let's fix the path.
				// It'll probably start with ., so let's check that and use the rest if so.
				if (modulePath[0] === '.') {
					prefix = modulePath.substr(1)
				} else {
					// But wait, that wasn't true? Don't be silly.
					throw new Error(`module ${modulePath} couldn't be converted to route path and none was given`)
				}
			}

			if (module.routes === undefined) {
				throw new Error(`module ${modulePath} isn't a koa-router instance`)
			}
		} catch(e) {
			log.warn(`module ${modulePath} failed to load. replacing ${prefix} with error page.`, e)
			module = require('koa-router')().use('*', function *() {
				this.body = `<!doctype html><style>body{font-family:sans-serif;}</style><p><b>This module (<code>${modulePath}</code>) failed to load.</b></p><pre style="padding:15px;background-color:#eee;border:1px solid #faa;">${e.stack}</pre>`
				this.status = 500
			})
		}


		this.router.use(prefix, module.routes(), module.allowedMethods())

	}

}

module.exports = Dbox