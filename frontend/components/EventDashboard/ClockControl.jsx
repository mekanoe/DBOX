import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import edStyle from '../../styles/EventDashboard'
const style = edStyle.clock

// import * as OverlayActions from '../stores/overlay'
// import styles from '../styles/overlay'

// import OverlayTop from './OverlayTop'

const mapState = (state) => {
	return {}
}

const actionMap = (dispatch) => {
	return {
		actions: {
			endRound: ()=>{},
			clockStart: ()=>{},
			clockStop: ()=>{},
			clockReset: ()=>{},
			clockPause: ()=>{},
			clockUnpause: ()=>{},
		}
	}
}

@connect(mapState, actionMap)
@Radium
export default class ClockControl extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	render() {

		return <div style={style.root}>
				<div style={style.time}>{this._renderTime()}</div>
				<div style={style.actionsBar} className="row">
					{this._renderActions()}
				</div>
		</div>
	}

	_renderActions() {
		let actions = []
		let clockState = 'stopped'
		let secondsLeft = 900

		switch(clockState) {
			case 'stopped':
				actions.push(<button key="stopped-start" disabled={secondsLeft === 0} onClick={this.props.actions.clockStart} style={style.actions.start}>Start</button>)
				actions.push(<button key="stopped-reset" onClick={this.props.actions.clockReset} style={style.actions.reset}>Reset</button>)
				actions.push(<button key="stopped-end" onClick={this.props.actions.endRound} style={style.actions.endRound}>End Round</button>)
				break

			case 'paused':
				actions.push(<button key="paused-unpause" onClick={this.props.actions.clockUnpause} style={style.actions.start}>Unpause</button>)
				actions.push(<button key="paused-reset" onClick={this.props.actions.clockReset} style={style.actions.reset}>Reset</button>)
				break

			case 'running':
				actions.push(<button key="running-pause" onClick={this.props.actions.clockPause} style={style.actions.pause}>Pause</button>)
				actions.push(<button key="running-stop" onClick={this.props.actions.clockStop} style={style.actions.stop}>Stop</button>)
				break;

		}

		return actions
	}

	_renderTime() {
		let secondsLeft  = 900

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