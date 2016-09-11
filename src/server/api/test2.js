const R = require('koa-router')()


R.get('/', function *(next){
	this.body = "nyaaaa!!2"
})


module.exports = R