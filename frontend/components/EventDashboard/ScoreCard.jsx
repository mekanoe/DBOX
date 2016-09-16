import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import edStyle from '../../styles/EventDashboard'
const style = edStyle.score

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
export default class ScoreCard extends Component {
	render() {
		let action = ""
		if (this.props.clockState === 'stopped') {
			action = <button key="stopped-next-round" onClick={this.props.actions.clockNextRound} style={style.nextRound}>Advance Round</button>
		} else {
			action = <button style={[style.nextRound,{backgroundColor:'#333'}]}>Waiting on Clock...</button>
		}

		return <div style={style.root}>
			<div key="tr" style={[style.card, style.red]}>
				<div style={style.cardHead}>TR</div>
				<div style={style.score}>{this.props.roundScores.get('3')}</div>
				<div style={style.cardFoot}>({this.props.matchScores.get('3')})</div>
			</div>
			<div key="vs" style={[style.card, style.purple]}>
				<div style={style.cardHead}>VS</div>
				<div style={style.score}>{this.props.roundScores.get('1')}</div>
				<div style={style.cardFoot}>({this.props.matchScores.get('1')})</div>

			</div>
			<div key="nc" style={[style.card, style.blue]}>
				<div style={style.cardHead}>NC</div>
				<div style={style.score}>{this.props.roundScores.get('2')}</div>
				<div style={style.cardFoot}>({this.props.matchScores.get('2')})</div>
			</div>
				{action}
		</div>
	}
}