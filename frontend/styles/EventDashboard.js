const pane = {
	padding: 10,
	margin: 5,
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

	meta: {
		root: {
			...pane,
			flex: 4,
			// display: 'flex',
			flexWrap: 'wrap',
			padding: 15
		},
		inputWidener: {
			display: 'block',
			overflow: 'hidden',
			display: 'flex'
		},
		input: {
			appearance: 'none',
			border: 0,
			flex: 1,
			margin: '5px 0',
			padding: '15px 10px',
			color: '#fff',
			backgroundColor: '#484d51'
		}
	},

	score: {
		root: {
			...pane,
			flex: 4,
			display: 'flex',
		},
		card: {
			flex: 1,
			textAlign: 'center',
			backgroundColor: '#000000',
			margin: 2.5,
			position: 'relative',
			height: '8em',
		},
		cardHead: {
			position: 'absolute',
			top: 5,
			right: 0,
			left: 0,
		},
		cardFoot: {
			position: 'absolute',
			bottom: 5,
			right: 0,
			left: 0,
		},

		score: {
			position: 'absolute',
			top: 0,
			right: 0,
			left: 0,
			bottom: 0,
			lineHeight: 1.6,
			fontSize: '5em',
			fontWeight: 'bold'
		},

		red: {
			backgroundColor: '#600',
			borderBottom: '5px solid #ddd',
		},
		blue: {
			backgroundColor: '#006',
			borderBottom: '5px solid #db0',
		},
		purple: {
			backgroundColor: '#403',
			// this isn't green because colour-blind users can't see the diff
			borderBottom: '5px solid #0ff',
		},
	},

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
				backgroundColor: '#000'
			},
			endRound: {
				...action,
				order: 9,
				flex: '100%',
				backgroundColor: '#328'

			},
		},
		roundBar: {
			textAlign: 'center',
			position: 'relative',
			backgroundColor: '#1c1e21',
			lineHeight: 1.4,
			padding: '10px 15px',
			height: '1.4em',
			margin: 2.5
		},
		round: {
			info: {
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				lineHeight: 2.7,
			},
			edit: {
				position: 'absolute',
				right: 0,
				top: 0,
				bottom: 0,
				lineHeight: 2.7,
				marginRight: 15,
				cursor: 'pointer',
			}
		},
	}
}

export default styles