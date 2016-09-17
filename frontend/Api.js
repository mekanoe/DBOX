import superagent from 'superagent'

const actions = {

	overlay: {
		patch: (overlayID, data) => {
			return superagent.patch(`/api/overlay/${overlayID}`).send(data)
		},
		reload: (overlayID, data) => {
			return superagent.put(`/api/overlay/${overlayID}`).send(data)
		}
	},

	match: {

		get: (matchID) => {
			return superagent.get(`/api/match/${matchID}`)
		},

		start: (matchID) => {
			return superagent.put(`/api/match/${matchID}`)
		},

		winner: { 
			post: (matchID, data) => {
				return superagent.post(`/api/match/${matchID}/winner`).send(data)
			}
		},

		round: {

			post: (matchID, data) => {
				return superagent.post(`/api/match/${matchID}/round`).send(data)
			},

		},

		clock: {

			get: (matchID) => {
				return superagent.get(`/api/match/${matchID}/clock`)
			},

			post: (matchID, data) => {
				return superagent.post(`/api/match/${matchID}/clock`).send(data)
			},

			reset: (matchID, data) => {
				return superagent.put(`/api/match/${matchID}/clock`).send(data)
			}

		}

	}

}

export default actions