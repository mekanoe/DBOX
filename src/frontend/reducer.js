import { combineReducers } from 'redux'
import { routeReducer } from 'react-router-redux'

import overlay from './stores/overlay'
import overlayMatchData from './stores/overlayMatchData'

export default combineReducers({
	overlay,
	overlayMatchData,
	
	routing: routeReducer,
})