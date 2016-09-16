import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import edStyle from '../../styles/EventDashboard'
const style = edStyle.meta

import * as DashboardActions from '../../stores/dashboard'
import * as MatchActions from '../../stores/match'

const mapState = (state) => {
	return {
		...state.match,
		...state.dashboard,
	}
}

const actionMap = (dispatch) => {
	return {
		actions: {
			...bindActionCreators(DashboardActions, dispatch),
			...bindActionCreators(MatchActions, dispatch),
		}
	}
}

@connect(mapState, actionMap)
@Radium
export default class EventMeta extends Component {
	render() {
		return <div style={style.root}>
			<div><b>Overlay URL</b> (click to copy)</div>
			<div style={style.inputWidener}>
				<input 
					ref={(c) => this._input = c} 
					style={style.input}
					readOnly={true} 
					onFocus={(e) => { this._input.select(); document.execCommand('copy') }}
					value={this.props.overlayURL} />
			</div>
			<div style={{marginTop: 5}}>
				<b>Overlay Aspect Ratio</b>&nbsp;&nbsp;
				<select onChange={this.props.actions.changeOverlayRatio} value={this.props.overlayRatio}>
					<option value="16:9">16:9</option>
					<option value="21:9">21:9</option>
				</select>
			</div>
			<div style={{marginTop: 5}}>
				
			</div>
		</div>
	}
}