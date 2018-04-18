'use strict'

const {
  GEISHA,
  PLAYER,
  MOVE
} = require('./constants.js')
const {
  getShuffledDeck,
  playerToString
} = require('./utils.js')
const {
  gameOverSelector,
  currentPlayerSelector,
  handSelectors,
  roundOverSelector,
  currentFavourSelector,
  roundSelector,
  turnSelector
} = require('./selectors.js')

const moveSet = {
  [MOVE.SECRET]: null,
  [MOVE.TRADEOFF]: null,
  [MOVE.GIFT]: null,
  [MOVE.COMPETITION]: null
}

const initialMoves = {
  [PLAYER.FIRST]: Object.assign({}, moveSet),
  [PLAYER.SECOND]: Object.assign({}, moveSet)
}

const initialFavour = {
  [GEISHA.PURPLE_2]: null,
  [GEISHA.RED_2]: null,
  [GEISHA.YELLOW_2]: null,
  [GEISHA.BLUE_3]: null,
  [GEISHA.ORANGE_3]: null,
  [GEISHA.GREEN_4]: null,
  [GEISHA.PINK_5]: null
}

const err = (state, msg = '') => {
  const currentPlayerID = currentPlayerSelector(state)
  const player = playerToString(currentPlayerID)
  const round = roundSelector(state)
  const turn = turnSelector(state)
  throw new Error(`ERROR: ${msg}; player={${player}} round={${round}} turn={${turn}}`)
}

const hanamikojiReducer = (state = {}, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        round: 0,
        favour: initialFavour,
        deck: getShuffledDeck(),
        moves: initialMoves
      }

    case 'TURN':
      // The client should ensure that the game is not over yet before
      // submitting a new TURN action
      if (gameOverSelector(state)) {
        err(state, 'attempting to take turn when game is complete')
      }

      const { moveID, cards, pairs, responseCards } = action.payload
      const currentPlayerID = currentPlayerSelector(state)
      const hand = handSelectors[currentPlayerID](state)

      if (state.moves[currentPlayerID][moveID] !== null) {
        err(state, 'invalid move type, may have already been played')
      }

      let move

      switch (moveID) {
        case MOVE.SECRET:
          if (!cards || cards.size !== 1) {
            err(state, 'a card was not given for move type: "Secret"')
          }
          if (!cards.isSubsetOf(hand)) {
            err(state, 'given card is not in hand for move type: "Secret"')
          }

          move = { cards }
          break
        case MOVE.TRADEOFF:
          if (!cards || cards.size !== 2) {
            err(state, 'invalid cards given for move type: "Tradeoff"')
          }
          if (!cards.isSubsetOf(hand)) {
            err(state, 'given cards are not in hand for move type: "Tradeoff"')
          }

          move = { cards }
          break
        case MOVE.GIFT:
          if (!cards || cards.size !== 3) {
            err(state, 'invalid cards given for move type: "Gift"')
          }
          if (!cards.isSubsetOf(hand)) {
            err(state, 'given cards are not in hand for move type: "Gift"')
          }
          if (!responseCards || responseCards.size !== 1) {
            err(state, 'a card was not given in response for move type: "Gift"')
          }
          if (!responseCards.isSubsetOf(cards)) {
            err(state, 'response card is not in current players selection for move type: "Gift"')
          }

          move = { cards, responseCards }
          break
        case MOVE.COMPETITION:
          if (!pairs || pairs.length !== 2 || pairs[0].size !== 2 || pairs[1].size !== 2) {
            err(state, 'invalid pairs given for move type: "Competition"')
          }
          if (!pairs[0].isDisjointFrom(pairs[1])) {
            err(state, 'pairs contain duplicate cards for move type: "Competition"')
          }
          if (!pairs[0].isSubsetOf(hand) || !pairs[1].isSubsetOf(hand)) {
            err(state, 'given pair cards are not in hand for move type: "Competition"')
          }
          if (!pairs.includes(responseCards)) {
            err(state, 'response pair is not in current players selection for move type: "Competition"')
          }

          move = { pairs, responseCards }
          break
        default:
          err(state, 'invalid move type')
      }

      const newState = Object.assign({}, state, {
        moves: Object.assign({}, state.moves, {
          [currentPlayerID]: Object.assign({}, state.moves[currentPlayerID], {
            [moveID]: move
          })
        })
      })

      if (roundOverSelector(newState)) {
        const newFavour = currentFavourSelector(newState)
        const endOfRoundState = Object.assign({}, newState, {
          favour: newFavour
        })

        if (gameOverSelector(endOfRoundState)) {
          return endOfRoundState
        }

        return {
          round: state.round + 1,
          favour: newFavour,
          deck: getShuffledDeck(),
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
