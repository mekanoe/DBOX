import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import * as OverlayActions from '../stores/overlay'
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
		this.props.actions.startListening()
	}

	render() {
		return <div>
			<OverlayTop/>
		</div>
	}
}