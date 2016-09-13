import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import ClockControl from './EventDashboard/ClockControl'

// import * as OverlayActions from '../stores/overlay'
// import styles from '../styles/overlay'

// import OverlayTop from './OverlayTop'

// const mapState = (state) => {
// 	return {
// 		...state.overlay,
// 	}
// }

// const actionMap = (dispatch) => {
// 	return {
// 		actions: {
// 			...bindActionCreators(OverlayActions, dispatch),
// 		}
// 	}
// }

// @connect(mapState, actionMap)
@Radium
export default class EventDashboard extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	componentWillMount() {
		// this.props.actions.fetchData(this.props.params.eventID)
		// this.props.actions.startListening(this.props.params.eventID)
	}

	componentWillUnmount() {
		// this.props.actions.stopListening(this.props.params.eventID)
	}

	render() {
		return <div style={{display: 'flex'}}>
				<div style={{flex:8}}></div>
				<ClockControl />
		</div>
	}

}