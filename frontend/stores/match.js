import api from '../Api'
import { routeActions } from 'react-router-redux'
import { Map } from 'immutable'

import * as dashboardActions from './dashboard'

const defaultTime = 900 // 15 minutes

const initialState = {
	
	// Round Data
	round: 0,
	roundScores: Map({
		1: 0, // VS 
		2: 0, // NC
		3: 0, // TR
	}),

	// Match Data
	matchScores: Map({
		1: 0, // VS 
		2: 0, // NC
		3: 0, // TR
	}),

	// Match Meta
	matchID: 1,

	// Clock
	secondsLeft: 900,
	clockInterval: null,
	clockState: 'stopped',
}

export default function reducer(state = initialState, {type, data}) {
	// console.log(type, data)

	switch(type) {

		case 'm:initial': 

			let match = {
				round: data.match.currentRound,
				roundScores: Map(data.match.rounds[data.match.currentRound-1].scores),
				matchScores: Map(data.match.overallScores),
			}


			return {
				...state,
				...match
			}

		case 'm:round_change':

			let mrc = {
				round: data.round,
				roundScores: initialState.roundScores,
			}

			return {
				...state,
				...mrc,
			}

		case 'm:clock_state':

			return {
				...state,
				clockState: data.state
			}

		case 'm:clock_time':

			return {
				...state,
				secondsLeft: data.secondsLeft
			}

		case 'm:clock_intv':

			return {
				...state,
				clockInterval: data.intv
			}

		case 'm:score_increment':

			return {
				...state,
				roundScores: state.roundScores.set(data.faction, state.roundScores.get(data.faction) + 1),
				matchScores: state.matchScores.set(data.faction, state.matchScores.get(data.faction) + 1),
			}

		default:

			return state

	}
}

export function getMatchInfo(id) {
	return function(dispatch) {
		api.match.get(id).then((data) => {

			if (data.status !== 200) {
				// dispatch(dashboardActions.error(data))
				return
			}

			dispatch({ type: 'm:initial', data: { match: data.body } })
			// dispatch(dashboardActions.initializeMatchData(data.body))
		}, (err) => {
			throw err
		})
	}
}

export function scoreIncrement(faction) {
	return function(dispatch) {
		dispatch({type: 'm:score_increment', data: { faction }})
	}
}

export function clockNextRound() {
	return function(dispatch, getState) {
		let { dashboard: { overlayID } } = getState()

		api.match.round.post(overlayID, { next: true }).then((data) => {
			console.log(data)
		}, (err) => {
			throw err
		})

	}
}

export function clockStart() {
	return function(dispatch, getState) {
		let { dashboard: { overlayID } } = getState()

		console.log('clockStart', overlayID)

		api.match.clock.post(overlayID, { state: 'started' }).then((data) => {
			console.log(data.ok)
		})

	}
}

export function clockStop() {
	return function(dispatch, getState) {
		let { dashboard: { overlayID } } = getState()

		console.log('clockStop', overlayID)

		api.match.clock.post(overlayID, { state: 'stopped' }).then((data) => {
			console.log(data.ok)
		})
	}
}

export function clockReset() {
	return function(dispatch, getState) {
		let { dashboard: { overlayID } } = getState()

		console.log('clockReset', overlayID)

		api.match.clock.reset(overlayID).then((data) => {
			console.log(data.ok)
		})
	}
}

export function clockStartTimer() {
	return function(dispatch, getState) {

		let intv = setInterval(() => {
			let { match: { secondsLeft, clockInterval } } = getState()
			
			if (secondsLeft > 0) {
				dispatch({ type: 'm:clock_time', data: { secondsLeft: secondsLeft-1 } })
			} else {
				clearInterval(clockInterval)
			}

		}, 1000)

		dispatch({ type: 'm:clock_intv', data: { intv } })

	}
}

export function clockStopTimer() {
	return function(dispatch, getState) {

		let { match: { clockInterval } } = getState()

		clearInterval(clockInterval)

	}
}

export function clockInit() {
	return function(dispatch, getState) {

		let { dashboard: { overlayID } } = getState()

		api.match.clock.get(overlayID).then((r) => {
			let data = r.body

			dispatch({ type: 'm:clock_time', data: { secondsLeft: data.time } })
			dispatch({ type: 'm:clock_state', data: { state: data.state } })
			if ( data.state === 'started' ) {
				dispatch(clockStartTimer())
				dispatch({ type: 'o:hide_content', data: { hideContent: false } })
			}
		})

	}
}

export function matchSelectWinner(winner) {
	return function(dispatch, getState) {
		let { match: { clockState }, dashboard: { overlayID } } = getState()

		// we only do things if the clock is stopped
		if ( clockState === 'stopped' ) {
			api.match.winner.post(overlayID, { winner }).then(() => {})
		}
	}
}