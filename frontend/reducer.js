import { combineReducers } from 'redux'
import { routeReducer } from 'react-router-redux'

import dashboard from './stores/dashboard'
import match from './stores/match'
import overlay from './stores/overlay'
import stats from './stores/stats'

export default combineReducers({
	dashboard,
	match,
	overlay,
	stats,
		
	routing: routeReducer,
})