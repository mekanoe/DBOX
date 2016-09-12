const R = require('koa-router')()
const Character = require('../data/Character')

R.get('/', function *(next){
	this.body = "nyaaaa"
})


.get('/c-c/:id', function *(next){
	yield this.app.context.redis.get(`character:${this.params.id}`).then((data) => {
		if (data === null) {
			this.body = {
				error: true,
				msg: 'not found'
			}
			this.status = 404

		} else {
			this.body = data
		}
	})
})

.get('/cname/:id', function *(next){
	let C = new Character({services:{redis:this.app.context.redis,r:this.app.context.r}})

	yield C.byID(this.params.id).then((char) => {
		this.body = char.name.first
	}).catch((err) => {
		this.body = {error: true, message: err}

		if (err !== 'not found') {
			this.code = 500
		} else {
			this.code = 404
		}
	})

})


module.exports = R