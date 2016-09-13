const pane = {
	padding: 10,
	margin: 10,
	backgroundColor: '#33363c',
}

const action = {
	flex: 1,
	appearance: 'none',
	border: 0,
	padding: '10px 15px',
	margin: 2.5,
	cursor: 'pointer',
	color: '#fff',
	textShadow: '1px 1px 2px #333639'
}

const styles = {
	clock: {
		root: {
			...pane,
			flex: 4,
		},
		time: {
			fontSize: '5em',
			textAlign: 'center',
			fontWeight: 'bold'
		},
		actionsBar: {
			display: 'flex',
			flexWrap: 'wrap'
		},
		actions: {
			start: {
				...action,
				backgroundColor: '#2a0',
				// ':disabled': {
				// 	backgroundColor: '#afafaf'
				// },
				':hover': {
					backgroundColor: '#280'
				}
			},
			stop: {
				...action,

			},
			pause: {
				...action,

			},
			unpause: {
				...action,

			},
			reset: {
				...action,

			},
			endRound: {
				...action,
				order: 9,
				flex: '100%',
				backgroundColor: '#328'

			},
		}
	}
}

export default styles