import React, { Component } from 'react'
import { render } from 'react-dom' 
import { Provider } from 'react-redux'
import Radium, { StyleRoot, Style } from 'radium'

import { 
	Router, 
	Route, 
	IndexRoute, 
	Link,
	IndexLink, 
	browserHistory 
} from 'react-router'

import store from './store'
import globalStyle from './styles/panel-global'
import style from './styles/panel-root'

import NotFound from './components/NotFound'
import EventDashboard from './components/EventDashboard'

@Radium
class Root extends Component {
	render() {
		return <div style={style.mainContent} className="row">
			{this.props.children}
		</div>
	}
}

@Radium
class DevRuler extends React.Component {
	render() {
		return <div>
			<div key="sm" className="" style={[style.devRuler.shared, style.devRuler.sm]}>SM</div>
			<div key="md" style={[style.devRuler.shared, style.devRuler.md]}>MD</div>
			<div key="lg" style={[style.devRuler.shared, style.devRuler.lg]}>LG</div>
		</div>
	}
}

class DboxPanel extends Component {
	constructor(props) {
		super(props)
	}

	render() {

		let devRuler = ""

		if (__DEVELOPMENT__) {
			devRuler = <DevRuler />
		}

		return <StyleRoot>
			<Style rules={globalStyle}></Style>
			<Provider store={store}>
				<Router history={browserHistory}>
					<Route path="/" component={Root}>
						<Route path="/event/:eventID" component={EventDashboard} />
						<IndexRoute component={NotFound} />
						<Route path="*" component={NotFound}  />
					</Route>
				</Router>
			</Provider>
			{devRuler}
		</StyleRoot>
	}
}

render(<DboxPanel />, document.querySelector('.container'))