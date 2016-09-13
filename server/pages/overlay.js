const R = require('koa-router')()
const cofs = require('co-fs')
const fs = require('fs')


R.get('/:matchId', function *(next) {

	//TODO: 404 if match doesn't exist
	this.body = yield cofs.readFile(fs.realpathSync('dist/frontend/overlay.html'), 'utf8')

})

module.exports = R