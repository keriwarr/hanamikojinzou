'use strict'

const { OrderedSet } = require('immutable')

const { PLAYERS } = require('./constants.js')
const {
  gameOverSelector,
  currentPlayerSelector,
  winnerSelector
} = require('./selectors.js')
const { getOtherPlayer } = require('./utils.js')

const executeTrial = (store, player1, player2) => {
  store.dispatch({ type: 'INITIALIZE' })

  const players = {
    [PLAYERS.P1]: player1,
    [PLAYERS.P2]: player2
  }

  while (!gameOverSelector(store.getState())) {
    const currentPlayerID = currentPlayerSelector(store.getState())
    const currentPlayer = players[currentPlayerID]
    const otherPlayer = players[getOtherPlayer(currentPlayerID)]
    const currentPlayerCards = currentPlayer.getMove()
    // TODO: validate currentPlayerCards
    // TODO: How much validation to??
    const otherPlayerCards = (() => {
      if (currentPlayerCards.size === 3) {
        return OrderedSet([otherPlayer.getMove3Response(currentPlayerCards)])
      }

      if (currentPlayerCards.size === 4) {
        return otherPlayer.getMove4Response([
          currentPlayerCards.slice(0, 2),
          currentPlayerCards.slice(2, 4)
        ]).toOrderedSet()
      }

      return OrderedSet()
    })()

    store.dispatch({
      type: 'TURN',
      payload: {
        currentPlayerCards: currentPlayerCards.toOrderedSet(),
        otherPlayerCards: otherPlayerCards
      }
    })
  }

  return winnerSelector(store.getState())
}

module.exports = {
  executeTrial
}
