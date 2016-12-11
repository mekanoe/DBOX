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
		...state.overlay,
		...state.match,
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
		let winGrower = [styles.winGrowerInitial]
		let rootAnim = {}
		let titleAnim = {}
		let middleAnim = {}
		if (this.props.winGrowerActive === true) {
			winGrower.push(styles.winGrowerActive)
			winGrower.push(styles.winGrowerColor[this.props.winGrowerFaction])
			rootAnim = styles.rootWin[this.props.winGrowerFaction]
			titleAnim = styles.titleColor[this.props.winGrowerFaction]
		}
		if (this.props.middleUp === true) middleAnim = styles.middleAnim
		if (this.props.winGrowerFade === true) {
			winGrower.push(styles.winGrowerFade)
			rootAnim = titleAnim = {}
		}

		return <div style={[styles.root, rootAnim]}>
			<div style={winGrower} />
			<div style={[styles.middle, middleAnim, titleAnim]}>
				<div style={[styles.middleText]}>{this.props.titleText}</div>
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
		let state = (this.props.useFrozen) ? this.props.frozenState : this.props

		let ex = {}
		if (this.props.hideContent) {
			ex = styles.innerSidesContentHide
		}

		let ex2 = {}
		let img = {
			backgroundRepeat: 'no-repeat',
			backgroundImage: 'url(/assets/img/clock.png)',
			display: 'inline-block',
			height: 36,
			width: 36,
			transition: 'background-image 1s ease-in-out',
		}
		if (this.props.whiteContent) {
			ex2 = styles.innerSidesContentWhite
			img.backgroundImage = 'url(/assets/img/clock-white.png)'
		}

		return <div style={[styles.innerSides, styles.innerLeft]} onClick={this.props.actions.startTimer}>
			<div style={[styles.innerSidesContent, ex, ex2]}>ROUND {state.round}</div>
			<div style={[styles.innerSidesContent, ex, ex2]}>
				<div style={img} />&nbsp;
				<div style={styles.clock}>{this._renderTime()}</div>
			</div>

			<div style={styles.innerSpacer}/>
		</div>
	}

	_renderTime() {
		let state = (this.props.useFrozen) ? this.props.frozenState : this.props

		let { secondsLeft } = state

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
		let state = (this.props.useFrozen) ? this.props.frozenState : this.props

		let ex = {}
		if (this.props.hideContent) {
			ex = styles.innerSidesContentHide
		}

		let imgBase = {
			backgroundRepeat: 'no-repeat',
			backgroundImage: 'url(/assets/img/clock.png)',
			display: 'inline-block',
			height: 40,
			width: 40,
			transition: 'background-image 1s ease-in-out',
			backgroundSize: 'contain',
			position: 'relative'
		}
		let img = {
			tr: {
				backgroundImage: 'url(/assets/img/tr.png)',
			},
			nc: {
				backgroundImage: 'url(/assets/img/nc.png)',
				height: 42,
   				width: 42,
				top: 5
			},
			vs: {
				backgroundImage: 'url(/assets/img/vs.png)',
			},
		}
		let ex2 = {}
		if (this.props.whiteContent) {
			ex2 = styles.innerSidesContentWhite
			img = {
				tr: {
					backgroundImage: 'url(/assets/img/tr-white.png)',
				},
				nc: {
					backgroundImage: 'url(/assets/img/nc-white.png)',
					height: 42,
   					width: 42,
   					top: 5
				},
				vs: {
					backgroundImage: 'url(/assets/img/vs-white.png)',
				},
			}
		}


		return <div style={styles.innerSides}>
			<div style={styles.innerSpacer}/>
			<div style={[styles.innerSidesContent,ex,styles.rightRed,ex2]}><div style={[imgBase,img['tr']]} />&nbsp;{state.roundScores.get('3')}</div>
			<div style={[styles.innerSidesContent,ex,styles.rightPurple,ex2]}><div style={[imgBase,img['vs']]} />&nbsp;{state.roundScores.get('1')}</div>
			<div style={[styles.innerSidesContent,ex,styles.rightBlue,ex2]}><div style={[imgBase,img['nc']]} />&nbsp;{state.roundScores.get('2')}</div>

		</div>
	}
}