import { combineReducers } from 'redux'
import { routeReducer } from 'react-router-redux'

import dashboard from './stores/dashboard'
import match from './stores/match'
import overlay from './stores/overlay'
import overlayMatchData from './stores/overlayMatchData'

export default combineReducers({
	dashboard,
	match,
	overlay,
	overlayMatchData,
	
	routing: routeReducer,
})