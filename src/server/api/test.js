const R = require('koa-router')()


R.get('/', function *(next){
	this.body = "nyaaaa"
})


module.exports = R