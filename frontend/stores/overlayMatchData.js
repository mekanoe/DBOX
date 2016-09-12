import superagent from 'superagent'
import { Map } from 'immutable'

const initialState = {
	roundScores: Map({
		1: 0,
		2: 0,
		3: 0,
	}),

	round: 0,

	secondsLeft: 0,
	// roundTimerBlink: false,

	roundEnd: null,

	clockInterval: null,
}

export default function reducer(state = initialState, {type, data}) {
	switch(type) {

		// case 'md:set_round_end_time':

		// 	return {
		// 		...state,
		// 		roundEnd: +data.time,
		// 	}

		case 'md:set_round_seconds_left':

			return {
				...state,
				secondsLeft: data.secondsLeft
			}

		case 'md:set_clock_intv':

			return {
				...state,
				clockInterval: data.intv
			}

		case 'md:increment_score':

			return {
				...state,
				roundScores: roundScores.set(data.faction, roundScores.get(data.faction) + 1)
			}

		case 'md:set_all_scores':

			return {
				...state,
				roundScores: Map(data.scores)
			}

		case 'md:set_round':

			return {
				...state,
				round: +data.round
			}

		default:

			return state

	}
}