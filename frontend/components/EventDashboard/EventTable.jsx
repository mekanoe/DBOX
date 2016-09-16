import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Radium, { Style } from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

import edStyle from '../../styles/EventDashboard'
const style = edStyle.table

import * as DashboardActions from '../../stores/dashboard'
import * as MatchActions from '../../stores/match'

const mapState = (state) => {
	return {
		...state.match,
		...state.dashboard,
		...state.stats,
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
export default class EventTable extends Component {

	render() {

		let events = this.props.events.takeLast(500).reverse().map((v) => {
			return <EventEntry event={v} key={`${v.event.attacker_character_id}/${v.event.character_id}/${v.event.timestamp}`} />
		})

		return <div style={style.root}>
			<table className="event-table">
				<tbody>
				<tr style={style.head}>
					<th>?</th>
					<th>Attacker</th>
					<th>Victim</th>
					<th>Weapon ID</th>
					<th>Timestamp</th>
				</tr>
					
					{ events }

				</tbody>
			</table>
		</div>
	}

}

@Radium
class EventEntry extends Component {

	render() {
		let event = this.props.event.event
		let scoreStyle = 'no'
		if (this.props.event.scoreEvent) {
			scoreStyle = 'yes'
		}

		return <tr>
			<td style={[style.td,style.event.scoreEvent[scoreStyle]]}>&nbsp;</td>
			<td style={[style.td,style.event._player,style.event.player[event.attacker_faction_id]]}>{event.attacker_character_name}</td>
			<td style={[style.td,style.event._player,style.event.player[event.faction_id]]}>{event.character_name}</td>
			<td style={style.td}>{event.attacker_weapon_id}</td>
			<td style={style.td}>{event.timestamp}</td>
		</tr>

	}

}