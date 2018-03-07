'use strict'

const { OrderedSet } = require('immutable')

const {
  MOVE_SIZE_TO_MOVE_MAP,
  EXPECTED_OTHER_PLAYER_SELECTION_SIZE,
  StateRecord,
  MoveRecord
} = require('./constants.js')
const { getShuffledDeck } = require('./utils.js')
const {
  gameOverSelector,
  currentPlayerSelector,
  handSelectors,
  roundOverSelector,
  currentFavourSelector
} = require('./selectors.js')

const initialState = new StateRecord()

const hanamikojiReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return state.clear().set('deck', getShuffledDeck())
    case 'TURN':
      if (gameOverSelector(state)) { // Thus the client should ensure that the game is not over yet before submitting a new TURN action
        throw new Error('ERROR: attempting to take turn when game is complete')
      }

      const currentPlayerID = currentPlayerSelector(state)
      const { currentPlayerCards, otherPlayerCards } = action.payload

      if (!(currentPlayerCards instanceof OrderedSet) || !(otherPlayerCards instanceof OrderedSet)) {
        throw new Error(`ERROR: player returned invalid value`)
      }
      const hand = handSelectors[currentPlayerID](state)
      const move = MOVE_SIZE_TO_MOVE_MAP[currentPlayerCards.size]
      const expectedOtherPlayerCardCount = EXPECTED_OTHER_PLAYER_SELECTION_SIZE[move]

      // VALIADTE THE MOVE
      if (move === undefined || expectedOtherPlayerCardCount === undefined) {
        throw new Error(`ERROR: invalid move type`)
      }

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

      if (expectedOtherPlayerCardCount !== otherPlayerCards.size) {
        throw new Error(`ERROR: expected ${expectedOtherPlayerCardCount} selected cards from other player, got ${otherPlayerCards.size}`)
      }

      if (state.moves[currentPlayerID][move].self !== null) {
        throw new Error(`ERROR: that move has already been performed`)
      }

      // FIXME:
      // if (move === MOVES.M4) {
      //   const currentPlayerCardsArr = Array.from(currentPlayerCards.values())
      //   const otherPlayerCardsArr = Array.from(otherPlayerCards.values())

      //   if (( // TODO: can I make this cleaner?
      //     !otherPlayerCardsArr.includes(currentPlayerCardsArr[0]) || !otherPlayerCardsArr.includes(currentPlayerCardsArr[1])
      //   ) && (
      //       !otherPlayerCardsArr.includes(currentPlayerCardsArr[2]) || !otherPlayerCardsArr.includes(currentPlayerCardsArr[3]
      //       ))) {
      //     throw new Error('ERROR: other players choice for move 4 was not among first two or last two cards')
      //   }
      // }

      // APPLY UPDATE TO STATE

      const newState = state.setIn(['moves', currentPlayerID, move], new MoveRecord({
        self: currentPlayerCards,
        other: otherPlayerCards
      }))

      if (roundOverSelector(newState)) {
        const endOfRoundState = newState.set('favour', currentFavourSelector(newState))

        if (gameOverSelector(endOfRoundState)) return endOfRoundState

        return endOfRoundState
          .remove('moves')
          .set('deck', getShuffledDeck())
          .set('round', state.round + 1)
      }

      return newState
    default:
      return state
  }
}

module.exports = {
  hanamikojiReducer
}
