import React, { Component } from 'react'
import { render } from 'react-dom' 
import { StyleRoot, Style } from 'radium'
import { Provider } from 'react-redux'

import store from './store'
import globalStyle from './styles/overlay-global'

import OverlayRoot from './components/OverlayRoot'

class DboxOverlay extends Component {
	constructor(props) {
		super(props)
	}

	render() {

		return <StyleRoot>
			<Style rules={globalStyle}></Style>
			<Provider store={store}>
				<OverlayRoot/>
			</Provider>
		</StyleRoot>
	}
}

// XSplit-specific secret sauce flag.
try {
	window.external.SetLocalProperty('prop:Browser60fps','1')
} catch(e) {
	console.log('probably not xsplit, hope OBS does 60fps. yolo.', e)
}

render(<DboxOverlay />, document.querySelector('.container'))