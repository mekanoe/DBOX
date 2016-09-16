import { OrderedSet } from 'immutable'

const initialState = {
	events: OrderedSet()
}

export default function reducer(state = initialState, {type, data}) {

	switch(type) {

		case 's:event':

			return {
				...state,
				events: state.events.add(data.event)
			}

		default:

			return state

	}

}