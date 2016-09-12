import v from './__vars'

const styles = {
	root: {
		height: 77,
		position: 'absolute',
		top: 0,
		right: 0,
		left: 0,

		backgroundColor: v.white,
		textShadow: `1px 1px 2px ${v.black}`
	},


	middle: {
		backgroundColor: v.black,
		width: 680,
		margin: '0 auto',
		color: v.white,
		textAlign: 'center',
		height: 81,
		lineHeight: '77px',
		fontSize: '49px',
		zIndex: 1,
		transform: 'perspective(77px) rotateX(-7deg)',
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
		zIndex: 0,
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
	},

	innerSpacer: {
		minWidth: 420,
	},

	innerLeft: {
		color: v.orange,
	},

	rightRed: { color: v.red },
	rightBlue: { color: v.blue },
	rightPurple: { color: v.purple },

	clock: {
		minWidth: '3em',
		display: 'inline-block',
		textAlign: 'center',
	},
}

export default styles