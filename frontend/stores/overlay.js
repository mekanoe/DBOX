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

export function startEventListener(id) {
	return (dispatch) => {

		let socket = io(/*`match/${id}`*/)

		socket.on('event', {

		})

	}
}

export function startTimer() {
	return (dispatch, getState) => {
		let intv = setInterval(() => {
			let { overlayMatchData: { secondsLeft, clockInterval } } = getState()
			
			if (secondsLeft > 0) {
				dispatch({ type: 'md:set_round_seconds_left', data: { secondsLeft: secondsLeft-1 } })
			} else {
				clearInterval(clockInterval)
			}

		}, 1000)

		dispatch({ type: 'md:set_clock_intv', data: { intv } })
	}
}

export function stopTimer() {
	return (dispatch, getState) => {
		const { overlayMatchData: { clockInterval } } = getState()
		clearInterval(clockInterval)
	}
}