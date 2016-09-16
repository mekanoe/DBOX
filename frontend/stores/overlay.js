import superagent from 'superagent'
import { Map } from 'immutable'
import io from 'socket.io-client'

import * as matchActions from './match'

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

export function startListening() {
	return (dispatch) => {

		let url = location.pathname.split('/')
		let id = url[url.length-1]

		dispatch(matchActions.clockInit())

		let socket = io(`/match/${id}`, { transports: ['websocket'] })

		socket.on('event', (evt) => {
			console.log('got event', evt)

			let { type, data } = evt
			
			// DASHBOARD EVENT REDUCER
			switch(type) {

				case 'clock-state':

					dispatch({ type: 'm:clock_state', data: data })

					switch(data.state) {
						case 'unpaused':
						case 'started':
							dispatch(matchActions.clockStartTimer())
							break
						case 'paused':
						case 'stopped':
							dispatch(matchActions.clockStopTimer())
							break
					}
					break

				case 'clock-sync':

					dispatch({ type: 'm:clock_time', data: { secondsLeft: data.time } })

					break

				case 'score':

					dispatch(matchActions.scoreIncrement(data.faction))

					break

				case 'round-change':

					dispatch({ type: 'm:round_change', data: { round: data.round } })

					break

			}
		})

	}
}

