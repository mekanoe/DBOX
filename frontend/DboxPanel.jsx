import React, { Component } from 'react'
import { render } from 'react-dom' 

import { 
	Router, 
	Route, 
	IndexRoute, 
	NotFoundRoute,
	Link,
	IndexLink, 
	browserHistory 
} from 'react-router'

class Forge extends Component {
	constructor(props) {
		super(props)
	}

	render() {

		return <StyleRoot>
			<Style rules={globalStyle}></Style>
			<Provider store={store}>
				<div>

				</div>
			</Provider>
		</StyleRoot>
	}
}

render(<Forge />, document.querySelector('.container'))