

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
	}


	////
	// @internal
	// Mount the routes! Makes heavy use of Dbox#_route.
	_mountRoutes() {

		//

		// Only mount test routes in development.
		if (process.env.NODE_ENV === 'development') this._route('./api/test')

	}


	////
	// @internal
	// This is a sugar method so we don't have to keep vars in our route mounter.
	// If you don't pass a prefix, it'll try to figure it out via the module path.
	// This lets you put your routes canonical to their URL, e.g. /api/users can sit at ./api/users.js
	//
	// Arguments
	//   modulePath str
	//   prefix     str?{<null>}
	_route(modulePath, prefix = null) {
		let module = require(modulePath)

		if (prefix === null) {
			// So we weren't given a prefix, so we did some canonical magic. Let's fix the path.
			// It'll probably start with ., so let's check that and use the rest if so.
			if (modulePath[0] === '.') {
				prefix = modulePath.substr(1)
			} else {
				// But wait, that wasn't true? Don't be silly.
				throw `module ${modulePath} couldn't be converted to route path and none was given`
			}
		}

		this.router.use(prefix, module.routes(), module.allowedMethods())

	}

}

module.exports = Dbox