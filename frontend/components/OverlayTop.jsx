import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'
import moment from 'moment'

import * as OverlayActions from '../stores/overlay'
import styles from '../styles/overlay-top'

const mapState = (state) => {
	return {
		overlay: state.overlay,
		overlayMatchData: state.overlayMatchData,
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
export default class OverlayTop extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	render() {
		return <div style={styles.root}>
			<div style={styles.middle}>
				<div style={styles.middleText}>{this.props.overlay.titleText}</div>
			</div>

			<div style={styles.inner}>
				<OverlayTopLeft/>
				<OverlayTopRight/>
			</div>
		</div>
	}
}

@connect(mapState, actionMap)
@Radium
class OverlayTopLeft extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	render() {
		return <div style={[styles.innerSides, styles.innerLeft]} onClick={this.props.actions.startTimer}>
			<div style={styles.innerSidesContent}>ROUND {this.props.overlayMatchData.round}</div>
			<div style={styles.innerSidesContent}>O {this._renderTime()}</div>

			<div style={styles.innerSpacer}/>
		</div>
	}

	_renderTime() {
		let { secondsLeft } = this.props.overlayMatchData

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

@connect(mapState, actionMap)
@Radium
class OverlayTopRight extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	render() {
		return <div style={styles.innerSides}>
			<div style={styles.innerSpacer}/>
			<div style={[styles.innerSidesContent,styles.rightRed]}>O {this.props.overlayMatchData.roundScores.get('3')}</div>
			<div style={[styles.innerSidesContent,styles.rightPurple]}>O {this.props.overlayMatchData.roundScores.get('1')}</div>
			<div style={[styles.innerSidesContent,styles.rightBlue]}>O {this.props.overlayMatchData.roundScores.get('2')}</div>

		</div>
	}
}