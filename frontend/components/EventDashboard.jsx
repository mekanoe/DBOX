import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import ClockControl from './EventDashboard/ClockControl'
import EventMeta from './EventDashboard/EventMeta'
import ScoreCard from './EventDashboard/ScoreCard'

import * as dashboardActions from '../stores/dashboard'
import * as matchActions from '../stores/match'

const mapState = ({match, dashboard}) => {
	return {
		match,
		dashboard,
	}
}

const actionMap = (dispatch) => {
	return {
		actions: {
			match: bindActionCreators(matchActions, dispatch),
			dashboard: bindActionCreators(dashboardActions, dispatch),
		}
	}
}

@connect(mapState, actionMap)
@Radium
export default class EventDashboard extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	componentWillMount() {
		// this.props.actions.fetchData(this.props.params.eventID)
		this.props.actions.dashboard.startListening(this.props.params.eventID)
		this.props.actions.match.getMatchInfo(this.props.params.eventID)
	}

	componentWillUnmount() {
		// this.props.actions.stopListening(this.props.params.eventID)
	}

	render() {
		return <div style={{display: 'flex', padding: 5}}>
				<EventMeta />
				<ScoreCard />
				<ClockControl />
		</div>
	}

}