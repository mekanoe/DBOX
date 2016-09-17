import superagent from 'superagent'
import { Map } from 'immutable'
import io from 'socket.io-client'

import * as matchActions from './match'

const initialState = {
	hideContent: true,
	titleText: 'Harasser Derby II',

}

export default function reducer(state = initialState, {type, data}) {
	switch(type) {

		case 'o:set_title':

			return {
				...state,
				titleText: data.text
			}

		case 'o:hide_content':

			return {
				...state,
				hideContent: data.hideContent
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
			// console.log('got event', evt)

			let { type, data } = evt
			
			// DASHBOARD EVENT REDUCER
			switch(type) {

				case 'clock-state':

					dispatch({ type: 'm:clock_state', data: data })

					switch(data.state) {
						case 'started':
							dispatch(matchActions.clockStartTimer())
							dispatch(uiEventShow())
							break
						case 'stopped':
							dispatch(matchActions.clockStopTimer())
							dispatch(uiEventHideDelayOnZero())
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

function uiEventShow() {
	return { type: 'o:hide_content', data: { hideContent: false } }

}

function uiEventHide() {
	return { type: 'o:hide_content', data: { hideContent: true } }

}

function uiEventHideDelay() {
	return function(dispatch) {

		console.log('hiding in 60 seconds')
		setTimeout(() => {
			console.log('hiding now')
			dispatch({ type: 'o:hide_content', data: { hideContent: true } })
		}, 60000)

	}
}

function uiEventHideDelayOnZero() {
	return function(dispatch, getState) {
		let { match: { secondsLeft } } = getState()

		if (secondsLeft === 0) {
			console.log('hiding in 60 seconds because zero')
			dispatch(uiEventHideDelay())
		} 
	}
}