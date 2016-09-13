import React, { Component } from 'react'
import Radium from 'radium'
import shouldPureComponentUpdate from 'react-pure-render/function'

const style = {
	root: {
		padding: '15px 25px',
		textAlign: 'center',
	}
}

@Radium
export default class NotFound extends Component {
	shouldComponentUpdate = shouldPureComponentUpdate

	render() {
		return <div style={style.root} className="col-xs-12">
			<h1>Not Found 😢</h1>
			<h3>If you were linked to this in error, call the police.</h3>
			<h3>💁📲📵, 📞👮🚓</h3>
		</div>
	}
}