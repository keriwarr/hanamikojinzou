const { createStore } = require('redux')

const {
  game,
  handSelector,
  gameOverSelector,
  currentPlayerSelector,
  winnerSelector,
  availableMovesSelector,
  PLAYER_1,
  PLAYER_2
} = require('./hanami.js')

const getOtherPlayer = player => player === PLAYER_1 ? PLAYER_2 : PLAYER_1

const simulation = (player1, player2) => {
  const store = createStore(game)

  store.dispatch({ type: 'INITIALIZE' })

  const api = playerID => ({
    getHand: () => handSelector(store.getState())(playerID),
    getAvailableMoves: () => availableMovesSelector(store.getState())(playerID)
  })

  const p1 = player1(api(PLAYER_1))
  const p2 = player2(api(PLAYER_2))
  const players = {
    [PLAYER_1]: p1,
    [PLAYER_2]: p2
  }

  while (!gameOverSelector(store.getState())) {
    const currentPlayer = currentPlayerSelector(store.getState())
    const otherPlayer = getOtherPlayer(currentPlayer)
    const currentPlayerCards = players[currentPlayer].getMove()
    const otherPlayerCards = (() => {
      if (currentPlayerCards.size === 3) return players[otherPlayer].getMove3Response(currentPlayerCards)
      if (currentPlayerCards.size === 4) return players[otherPlayer].getMove4Response(currentPlayerCards)
      return new Set()
    })()

    store.dispatch({
      type: 'TURN',
      payload: {
        cards: {
          currentPlayerCards,
          otherPlayerCards
        }
      }
    })
  }

  return winnerSelector(store.getState())
}

exports.simulation = simulation
