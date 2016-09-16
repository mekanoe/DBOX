import api from '../Api'
import { routeActions } from 'react-router-redux'
import { Map } from 'immutable'
import io from 'socket.io-client'

import * as matchActions from './match'

const initialState = {
	overlayURL: 'https://dbox.harasse.rs/o/1',
	overlayID: 1,
	overlayRatio: '16:9',
}

export default function reducer(state = initialState, {type, data}) {
	switch(type) {

		case 'd:update_o_ratio':

			return {
				...state,
				overlayRatio: data.ratio
			}

		default:

			return state

	}
}

export function changeOverlayRatio(evt) {
	return function(dispatch, getState) {
		let { dashboard: { overlayID } } = getState()

		api.overlay.patch(overlayID, { ratio: evt.target.value }).then((d) => {
			dispatch({ type: 'd:update_o_ratio', data: { ratio: d.body.payload.ratio } })
		}, (err) => {
			throw err
		})

	}
}

export function startListening(id) {
	return function(dispatch, getState) {

		dispatch(matchActions.clockInit())

		io(`/match/${id}`, { transports: ['websocket'] }).on('event', (evt) => {

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

				case 'round-change':

					dispatch({ type: 'm:round_change', data: { round: data.round } })

					break

				case 'score':

					dispatch(matchActions.scoreIncrement(data.faction))

					break

				case 'VehicleDestroy':

					dispatch({ type: 's:event', data: { event: data } })

				default:

					console.log('unknown event', evt)

			}

		}).on('event-raw', (evt) => {
			console.log('event raw:', evt)
		})

	}
}