const R = require('koa-router')()
const cofs = require('co-fs')
const fs = require('fs')


R.get('*', function *(next) {

	this.body = yield cofs.readFile(fs.realpathSync('dist/frontend/panel.html'), 'utf8')

})

module.exports = R