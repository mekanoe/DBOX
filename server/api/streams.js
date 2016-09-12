const R = require('koa-router')()

R.get('/', function *(next){

	this.body = { 
		streams: Object.keys(this.app.context.stats.getStreams().toJS())
	}

})

.post('/test-start', function *(next){
	let io = this.app.context.io

	let {streamId, stream} = this.app.context.stats.createStream({ world: 'Connery_1' })
	stream.on('VehicleDestroy', (event) => {
		io.emit('data', event)
	})

	this.body = {
		success: true,
		streamId
	}
})

.delete('/stream/:id')

module.exports = R