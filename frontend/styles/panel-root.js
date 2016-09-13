import respondTo from './mixins/respondTo'
import v from './__vars'

const styles = {

	mainContent: {
		backgroundColor: '#22252f',
		margin:'15px auto 0 auto',
		color: v.white,
		// display: 'flex',
		...respondTo({
			sm: {
				width: '100vw'
			},
			lg: {
				width: 1200
			}
		})
	},

	devRuler: {
		shared: {
			fontFamily: 'monospace',
			padding: 10,
			position: 'fixed',
			bottom: 0,
			right: 0,
			color: 'white',
		},
		sm: {
			...respondTo({sm: { display: 'block' }}, { display: 'none' }),
			backgroundColor: 'red'
		},
		md: {
			...respondTo({md: { display: 'block' }}, { display: 'none' }),
			backgroundColor: 'purple'
		},
		lg: {
			...respondTo({lg: { display: 'block' }}, { display: 'none' }),
			backgroundColor: 'blue'
		}
	}
}

export default styles