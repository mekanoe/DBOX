import v from './__vars'

const styles = {
	root: {
		height: 77,
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,

		backgroundColor: v.black,
		// textShadow: `1px 1px 2px ${v.black}`
		transition: 'background-color 0.5s ease-in-out'
	},

	rootWin: {
		tr: {
			backgroundColor: v.redAlt,
		},

		nc: {
			backgroundColor: v.blueAlt,
		},

		vs: {
			backgroundColor: v.purpleAlt2,
		},
	},

	middle: {
		backgroundColor: v.darkGray,
		// fontFamily: 'True Lies',
		width: 680,
		margin: '0 auto',
		color: v.white,
		textAlign: 'center',
		height: 81,
		lineHeight: '77px',
		fontSize: '49px',
		transform: 'perspective(77px) rotateX(-7deg) translateY(0)',
		transition: 'transform 1s ease-in-out 0.5s, background-color 0.5s ease-in-out 1.5s'
	},

	middleAnim: {
		transform: 'perspective(77px) rotateX(-7deg) translateY(-85px)',
	},

	titleColor: {
		tr: {
			backgroundColor: v.redAlt,
		},

		nc: {
			backgroundColor: v.blueAlt,
		},

		vs: {
			backgroundColor: v.purpleAlt,
		},
	},

	middleText: {
		transform: 'perspective(77px) rotateX(7deg)',
	},

	inner: {
		position: 'absolute',
		top: 3,
		right: 0,
		left: 0,
		height: 77,
		display: 'flex',
		padding: '0 55px',
	},

	innerSides: {
		flex: 1,
		display: 'flex',
		fontSize: '49px',
	},

	innerSidesContent: {
		flex: 1,
		textAlign: 'center',
		opacity: 1,
		transition: 'opacity 1s ease-in-out, color 1s ease-in-out'
	},

	innerSidesContentHide: {
		opacity: 0
	},

	innerSidesContentWhite: {
		color: '#fff'
	},

	innerSpacer: {
		minWidth: 420,
	},

	innerLeft: {
		color: v.orange,
	},

	rightRed: { color: v.red },
	rightBlue: { color: v.blueAlt2 },
	rightPurple: { color: v.purple },

	clock: {
		minWidth: '3em',
		display: 'inline-block',
		textAlign: 'center',
	},

	clockImg: {
		// boxShadow: `1px 1px 2px ${v.black}`

	},

	winGrowerInitial: {
		transition: 'opacity 1s ease-in-out, transform 1s ease-in-out 0s',
		transform: 'scaleX(0)',
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,
		height: 77,
		width: 2000,
		opacity: 1,
		zIndex: 0
	},

	winGrowerActive: {
		transform: 'scaleX(1)',
	},

	winGrowerFade: {
		opacity: 0,
	},

	winGrowerColor: {
		tr: {
			backgroundColor: v.red,
		},

		nc: {
			backgroundColor: v.blue,
		},

		vs: {
			backgroundColor: v.purple,
		},
	},
}

export default styles