import superagent from 'superagent'
import { routeActions } from 'react-router-redux'
import { Map } from 'immutable'

const initialState = {
	viewMode: '21:9',

	titleText: 'Harasser Derby II',
}

export default function reducer(state = initialState, {type, data}) {
	switch(type) {

		case 'o:set_title':

			return {
				...state,
				titleText: data.text
			}

		default:

			return state

	}
}