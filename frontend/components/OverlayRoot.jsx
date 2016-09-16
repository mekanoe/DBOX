import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import * as OverlayActions from '../stores/overlay'
import * as MatchActions from '../stores/match'
import styles from '../styles/overlay'

import OverlayTop from './OverlayTop'

const mapState = (state) => {
	return {
		...state.overlay,
	}
}

const actionMap = (dispatch) => {
	return {
		actions: {
			...bindActionCreators(OverlayActions, dispatch),
			match: bindActionCreators(MatchActions, dispatch)
		}
	}
}

@connect(mapState, actionMap)
@Radium
export default class OverlayRoot extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	componentWillMount() {
		// TODO: setup
		// fetchInitialData
	}

	componentDidMount() {
		// TODO: socket listener
		// startListening

		let url = location.pathname.split('/')
		let id = url[url.length-1]
		this.props.actions.startListening()
		this.props.actions.match.getMatchInfo(id)
	}

	render() {
		return <div>
			<OverlayTop/>
		</div>
	}
}