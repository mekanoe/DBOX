import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import edStyle from '../../styles/EventDashboard'
const style = edStyle.clock

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
			clockEditMode: ()=>{},
			clockStop: ()=>{},
			clockReset: ()=>{},
			clockPause: ()=>{},
			clockUnpause: ()=>{},
			...bindActionCreators(DashboardActions, dispatch),
			...bindActionCreators(MatchActions, dispatch),
		}
	}
}

@connect(mapState, actionMap)
@Radium
export default class ClockControl extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	render() {

		return <div style={style.root}>
				<div>{this._renderRound()}</div>
				<div style={style.time}>{this._renderTime()}</div>
				<div style={style.actionsBar}>
					{this._renderActions()}
				</div>
		</div>
	}

	_renderRound() {
		let { clockState, round } = this.props

		return <div style={style.roundBar}>
			<div style={style.round.info}>Round {round} ({clockState})</div>
			{/* ADD THIS FOR v2
			<div style={style.round.edit}><i className="fa fa-pencil" />&nbsp;&nbsp;<i className="fa fa-step-forward" onClick={this.props.actions.clockNextRound} /></div>
			*/}
		</div>
	}

	_renderActions() {
		let actions = []
		let { secondsLeft, clockState } = this.props

		switch(clockState) {
			case 'stopped':
				actions.push(<button key="stopped-start" disabled={secondsLeft === 0} onClick={this.props.actions.clockStart} style={style.actions.start}>Start</button>)
				actions.push(<button key="stopped-reset" onClick={this.props.actions.clockReset} style={style.actions.reset}>Reset</button>)
				break

			case 'started':
				actions.push(<button key="running-stop" onClick={this.props.actions.clockStop} style={style.actions.stop}>Stop</button>)
				break

		}

		return actions
	}

	_renderTime() {
		let secondsLeft  = this.props.secondsLeft

		if (secondsLeft < 0) {
			secondsLeft = 0
		}

		let minutes = Math.floor(secondsLeft / 60)
		let seconds = secondsLeft % 60

		return `${this._pad(minutes)}:${this._pad(seconds)}`
	}

	_pad(num) {
		let str = num + ''

		if (num === 0) {
			str = '00'
		} else if (num < 10) {
			str = '0' + num
		}

		return str
	}

}