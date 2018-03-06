'use strict'

const {
  PLAYERS,
  MOVES,
  MOVE_SIZE_TO_MOVE_MAP,
  EXPECTED_OTHER_PLAYER_SELECTION_SIZE
} = require('./constants.js')
const { getNewDeck } = require('./utils.js')
const {
  gameOverSelector,
  currentPlayerSelector,
  handSelector,
  roundOverSelector,
  currentFavourSelector
} = require('./selectors.js')

const initialState = {
  round: undefined,
  favour: undefined,
  deck: undefined,
  moves: undefined
}

// For moves three and four which have `other` keys, the data is modeled as such:
// `self` represents all of the cards that the current player chose to offer to the other player
// `other` represents the cards that the other player chose
// Thus, other is a strict subset of self, and so some of the cards in self, are actually played on the other players side of the board
// Furthermore, we have the invariant that the union of all the cards under the self keys for a plyaer are all the cards they've played so for this round
// And so, the union of a players `self` cards will ultimately compromise the full set of cards that they had received into their hand on that round.
const initialMoves = {
  [PLAYERS['1']]: [
    { self: null },
    { self: null },
    { self: null, other: null },
    { self: null, other: null }
  ],
  [PLAYERS['2']]: [
    { self: null },
    { self: null },
    { self: null, other: null },
    { self: null, other: null }
  ]
}

const hanamikojiReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        round: 0,
        favour: [null, null, null, null, null, null, null],
        deck: getNewDeck(),
        moves: initialMoves
      }
    case 'TURN':
      if (gameOverSelector(state)) { // Thus the client should ensure that the game is not over yet before submitting a new TURN action
        throw new Error('ERROR: attempting to take turn when game is complete')
      }

      const { currentPlayerCards, otherPlayerCards } = action.payload.cards
      const currentPlayer = currentPlayerSelector(state)
      const hand = handSelector(state)(currentPlayer)
      const move = MOVE_SIZE_TO_MOVE_MAP[currentPlayerCards.size]
      const expectedOtherPlayerCardCound = EXPECTED_OTHER_PLAYER_SELECTION_SIZE[move]

      // VALIADTE THE MOVE

      currentPlayerCards.forEach(card => {
        if (!hand.has(card)) {
          throw new Error(`ERROR: current player does not have card ${card} in its hand`)
        }
      })
      otherPlayerCards.forEach(card => {
        if (!currentPlayerCards.has(card)) {
          throw new Error(`ERROR: other player selected card ${card}, which current player hand't offered`)
        }
      })

      if (move !== MOVES['1'] && move !== MOVES['2'] && move !== MOVES['3'] && move !== MOVES['4']) {
        throw new Error(`ERROR: invalid move type`)
      }

      if (expectedOtherPlayerCardCound !== otherPlayerCards.size) {
        throw new Error(`ERROR: expected ${expectedOtherPlayerCardCound} selected cards from other player, got ${otherPlayerCards.size}`)
      }

      if (state.moves[currentPlayer][move].self !== null) {
        throw new Error(`ERROR: that move has already been performed`)
      }

      if (move === MOVES['4']) {
        const currentPlayerCardsArr = Array.from(currentPlayerCards.values())
        const otherPlayerCardsArr = Array.from(otherPlayerCards.values())

        if (( // TODO: can I make this cleaner?
          !otherPlayerCardsArr.includes(currentPlayerCardsArr[0]) || !otherPlayerCardsArr.includes(currentPlayerCardsArr[1])
        ) && (
            !otherPlayerCardsArr.includes(currentPlayerCardsArr[2]) || !otherPlayerCardsArr.includes(currentPlayerCardsArr[3]
            ))) {
          throw new Error('ERROR: other players choice for move 4 was not among first two or last two cards')
        }
      }

      // APPLY UPDATE TO STATE

      const newState = {
        ...state,
        moves: {
          ...state.moves,
          [currentPlayer]: Object.assign([], state.moves[currentPlayer], {
            [move]: {
              self: currentPlayerCards,
              ...(otherPlayerCards.size > 0 ? { other: otherPlayerCards } : {})
            }
          })
        }
      }

      if (roundOverSelector(newState)) {
        const endOfRoundState = {
          ...newState,
          favour: currentFavourSelector(newState)
        }

        if (gameOverSelector(endOfRoundState)) return endOfRoundState

        return {
          round: state.round + 1,
          favour: currentFavourSelector(newState),
          deck: getNewDeck(),
          moves: initialMoves
        }
      }

      return newState
    default:
      return state
  }
}

module.exports = {
  hanamikojiReducer
}
