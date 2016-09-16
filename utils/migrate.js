//
// This is just a simple migrator for rethinkdb.
//
// Flags:
//  --all      - same as --create --database
//  --create   - creates tables
//  --database - creates database and removes test database
//  --reset    - drops database, needs --definitelyReset too
//

require('dotenv').config({silent: true});
const argv = require('yargs').argv

if (argv.database || argv.all) {
	const initial_r = new (require('rethinkdbdash'))({
		host: process.env.RETHINK_HOST || undefined,
		port: process.env.RETHINK_PORT || undefined,
		//silent: true,
	})

	console.log("> Creating db: dbox")
	initial_r.dbCreate('dbox').run()
	
	console.log("> Dropping db: test")
	initial_r.dbDrop('test').run().catch(() => {
		console.log('>> test didn\'t exist, that\'s ok. continuing.')
	})
}

const r = new (require('rethinkdbdash'))({
	db: 'dbox',
	host: process.env.RETHINK_HOST || undefined,
	port: process.env.RETHINK_PORT || undefined,
	buffer: 300,
	max: 3000,
	// silent: true,
})

console.log(r)

if (argv.reset && argv.definitelyReset) {
	console.log('> Dropping db: dbox')
	r.dbDrop('dbox').run().then(() => { 
		console.log('> Thank you for using stop & drop, the #1 suicide booth in the north Atlantic.')
		process.exit()
	})
}

// setup db/tables
if (argv.create || argv.all) {

	console.log('> Creating table: matches')
	let rchain = r.tableCreate('matches').run().then(() => {

		console.log('> Creating matches index: slug')
		return r.table('matches').indexCreate('slug').run()

	}).then(() => {

		console.log('> Creating table: users')
		return r.tableCreate('users').run()

	}).then(() => {

		console.log('> Creating users index: username')
		return r.table('users').indexCreate('username').run()

	}).then(() => {

		console.log('> Creating table: rounds')
		return r.tableCreate('rounds').run()

	}).then(() => {

		console.log('> Creating rounds index: matchID')
		return r.table('rounds').indexCreate('matchID').run()

	}).then(() => {

		console.log('> Creating table: events')
		return r.tableCreate('events').run()

	}).then(() => {

		console.log('> Creating events index: matchID')
		return r.table('events').indexCreate('matchID').run()

	}).then(() => {

		console.log('> Creating events index: round')
		return r.table('events').indexCreate('round').run()

	}).then(() => {

		console.log('> Creating events index: scoreEvent')
		return r.table('events').indexCreate('scoreEvent').run()

	}).then(() => {

		console.log('> Creating events index: timestamp')
		return r.table('events').indexCreate('timestamp').run()
		
	}).then(() => {

		console.log('> Creating table: auth_tokens')
		return r.tableCreate('auth_tokens').run()

	}).then(() => {

		console.log('> Creating auth_tokens index: eventID')
		return r.table('auth_tokens').indexCreate('eventID').run()

	// }).then(() => {

	// 	if (argv.seed !== false) {
	// 		return seed()
	// 	} else {
	// 		return true
	// 	}

	}).then(() => {

		process.exit()

	}).catch((err) => {

		console.error("A problem occurred:", err.msg)

	})


}