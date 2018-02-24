const { createStore } = require('redux')
const { createSelector } = require('reselect')
const util = require('util')

/**
 * IDEAS:
 * More computed views
 * - what moves you've played
 * - what moves they've played
 * - what happnend on the nth round
 */

const DECK = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const PURPLE_2 = 0
const RED_2 = 1
const YELLOW_2 = 2
const BLUE_3 = 3
const ORANGE_3 = 4
const GREEN_4 = 5
const BLACK_5 = 6
const CARD_TYPE = card => {
  if (card >= 0 && card <= 1) return PURPLE_2
  else if (card >= 2 && card <= 3) return RED_2
  else if (card >= 4 && card <= 5) return YELLOW_2
  else if (card >= 6 && card <= 8) return BLUE_3
  else if (card >= 9 && card <= 11) return ORANGE_3
  else if (card >= 12 && card <= 15) return GREEN_4
  else if (card >= 16 && card <= 20) return BLACK_5
  else throw new Error('ERROR: invalid card number')
}
const CARD_TYPES = [PURPLE_2, RED_2, YELLOW_2, BLUE_3, ORANGE_3, GREEN_4, BLACK_5]
const FAVOUR_VALUES = [2, 2, 2, 3, 3, 4, 5]
const CHARM_THRESHOLD = 11
const GEISHA_THRESHOLD = 4
const STARTING_HAND_SIZE = 7
const MAX_HAND_SIZE = 10

const PLAYER_1 = 0
const PLAYER_2 = 1

function shuffle (arr) {
  let a = arr.slice()
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

function getNewDeck () {
  return new Set(shuffle(DECK))
}

const roundSelector = state => state.round
const selectedCardsSelector = state => state.selectedCards
const deckSelector = state => state.deck
const favourSelector = state => state.favour
const turnSelector = createSelector(
  selectedCardsSelector,
  selectedCards => selectedCards[PLAYER_1].concat(selectedCards[PLAYER_2]).reduce(
    (total, selection) => selection.self === null && selection.other === null ? total : total + 1,
    0
  )
)
const currentPlayerSelector = createSelector(
  roundSelector,
  turnSelector,
  (round, turn) => (round + turn) % 2
)
const totalHandSelector = createSelector(
  turnSelector,
  deckSelector,
  (turn, deck) => playerID => {
    const start = playerID * MAX_HAND_SIZE
    const count = Math.floor(turn / 2) + STARTING_HAND_SIZE
    return new Set(Array.from(deck.values()).slice(start, start + count))
  }
)
const handSelector = createSelector(
  totalHandSelector,
  selectedCardsSelector,
  (totalHand, selectedCards) => playerID => {
    const playerTotalHand = totalHand(playerID)
    const hand = new Set(playerTotalHand)

    selectedCards[playerID].forEach(move => {
      if (move.self) move.self.forEach(card => hand.delete(card))
    })

    return hand
  }
)
const currentFavourSelector = createSelector(
  selectedCardsSelector,
  selectedCards => {
    const player1Cards = new Set()
    const player2Cards = new Set()
    const player1ItemCount = {
      [PURPLE_2]: 0,
      [RED_2]: 0,
      [YELLOW_2]: 0,
      [BLUE_3]: 0,
      [ORANGE_3]: 0,
      [GREEN_4]: 0,
      [BLACK_5]: 0
    }
    const player2ItemCount = {
      [PURPLE_2]: 0,
      [RED_2]: 0,
      [YELLOW_2]: 0,
      [BLUE_3]: 0,
      [ORANGE_3]: 0,
      [GREEN_4]: 0,
      [BLACK_5]: 0
    }

    // TODO: replace these indices with constants
    if (selectedCards[PLAYER_1][0].self) {
      selectedCards[PLAYER_1][0].self.forEach(card => player1Cards.add(card))
    }
    if (selectedCards[PLAYER_2][0].self) {
      selectedCards[PLAYER_2][0].self.forEach(card => player2Cards.add(card))
    }

    if (selectedCards[PLAYER_1][2].self) {
      selectedCards[PLAYER_1][2].self.forEach(card => player1Cards.add(card))
      // TODO: validation?? (Other should be not null)
      selectedCards[PLAYER_1][2].other.forEach(card => player1Cards.delete(card))
      selectedCards[PLAYER_1][2].other.forEach(card => player2Cards.add(card))
    }

    if (selectedCards[PLAYER_2][2].self) {
      selectedCards[PLAYER_2][2].self.forEach(card => player2Cards.add(card))
      selectedCards[PLAYER_2][2].other.forEach(card => player2Cards.delete(card))
      selectedCards[PLAYER_2][2].other.forEach(card => player1Cards.add(card))
    }

    if (selectedCards[PLAYER_1][3].self) {
      selectedCards[PLAYER_1][3].self.forEach(card => player1Cards.add(card))
      selectedCards[PLAYER_1][3].other.forEach(card => player1Cards.delete(card))
      selectedCards[PLAYER_1][3].other.forEach(card => player2Cards.add(card))
    }

    if (selectedCards[PLAYER_2][3].self) {
      selectedCards[PLAYER_2][3].self.forEach(card => player2Cards.add(card))
      selectedCards[PLAYER_2][3].other.forEach(card => player2Cards.delete(card))
      selectedCards[PLAYER_2][3].other.forEach(card => player1Cards.add(card))
    }

    player1Cards.forEach(card => {
      player1ItemCount[CARD_TYPE(card)] += 1
    })

    player2Cards.forEach(card => {
      player2ItemCount[CARD_TYPE(card)] += 1
    })

    return CARD_TYPES.map(type => {
      if (player1ItemCount[type] > player2ItemCount[type]) return PLAYER_1
      if (player2ItemCount[type] > player1ItemCount[type]) return PLAYER_2
      return null
    })
  }
)
const playerCharmSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => favour.map((player, index) => player === playerID ? FAVOUR_VALUES[index] : 0).reduce((a, b) => a + b, 0)
)
const player1CharmSelector = playerCharmSelectorCreator(PLAYER_1)
const player2CharmSelector = playerCharmSelectorCreator(PLAYER_2)
const playerGeishasSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => favour.map((player, index) => player === playerID ? 1 : 0).reduce((a, b) => a + b, 0)
)
const player1GeishaSelector = playerGeishasSelectorCreator(PLAYER_1)
const player2GeishaSelector = playerGeishasSelectorCreator(PLAYER_2)
const winnerSelector = createSelector(
  player1CharmSelector,
  player2CharmSelector,
  player1GeishaSelector,
  player2GeishaSelector,
  (p1charm, p2charm, p1geisha, p2geisha) => {
    if (p1charm >= CHARM_THRESHOLD && p2charm >= CHARM_THRESHOLD) throw new Error('Wat')
    else if (p1geisha >= GEISHA_THRESHOLD && p2geisha >= GEISHA_THRESHOLD) throw new Error('WAT')
    else if (p1charm >= CHARM_THRESHOLD) return PLAYER_1
    else if (p2charm >= CHARM_THRESHOLD) return PLAYER_2
    else if (p1geisha >= GEISHA_THRESHOLD) return PLAYER_1
    else if (p2geisha >= GEISHA_THRESHOLD) return PLAYER_2
    else return null
  }
)
const roundOverSelector = createSelector(
  turnSelector,
  turn => turn > 7
)
const gameOverSelector = createSelector(
  roundOverSelector,
  winnerSelector,
  (roundOver, winner) => roundOver && winner !== null
)

// TODO: computed views
// - size of enemies hand

const INITIALIZE = 'INITIALIZE'
const TURN = 'TURN'

const initialState = {
  round: undefined,
  favour: undefined,
  deck: undefined,
  selectedCards: undefined
}

function game (state = initialState, action) {
  switch (action.type) {
    case INITIALIZE:
      return {
        round: 0,
        favour: [null, null, null, null, null, null, null],
        deck: getNewDeck(),
        selectedCards: {
          [PLAYER_1]: [
            { self: null, other: null },
            { self: null, other: null },
            { self: null, other: null },
            { self: null, other: null }
          ],
          [PLAYER_2]: [
            { self: null, other: null },
            { self: null, other: null },
            { self: null, other: null },
            { self: null, other: null }
          ]
        }
      }
    case TURN:
      if (gameOverSelector(state)) {
        throw new Error('ERROR: attempting to take turn when game is complete')
      }

      const { currentPlayerCards, otherPlayerCards } = action.payload.cards
      const currentPlayer = currentPlayerSelector(state)
      const hand = handSelector(state)(currentPlayer)
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
      const moveType = currentPlayerCards.size

      const expectedOtherPlayerCardCound = (() => {
        switch (moveType) {
          case 1:
            return 0
          case 2:
            return 0
          case 3:
            return 1
          case 4:
            return 2
          default:
            throw new Error(`ERROR: invalid move type - ${moveType} cards were selected`)
        }
      })()
      if (expectedOtherPlayerCardCound !== otherPlayerCards.size) {
        throw new Error(`ERROR: expected ${expectedOtherPlayerCardCound} selected cards from other player, got ${otherPlayerCards.size}`)
      }

      const moveIndex = moveType - 1

      if (state.selectedCards[currentPlayer][moveIndex].self !== null) {
        throw new Error(`ERROR: invalid move type = ${moveType} has already been performed`)
      }

      const newState = {
        ...state,
        selectedCards: {
          ...state.selectedCards,
          [currentPlayer]: Object.assign([], state.selectedCards[currentPlayer], {
            [moveIndex]: {
              self: currentPlayerCards,
              other: otherPlayerCards
            }
          })
        }
      }

      if (gameOverSelector(newState)) return newState

      if (roundOverSelector(newState)) {
        return { ...state,
          round: state.round + 1,
          favour: currentFavourSelector(newState),
          deck: getNewDeck(),
          selectedCards: {
            [PLAYER_1]: [
              { self: null, other: null },
              { self: null, other: null },
              { self: null, other: null },
              { self: null, other: null }
            ],
            [PLAYER_2]: [
              { self: null, other: null },
              { self: null, other: null },
              { self: null, other: null },
              { self: null, other: null }
            ]
          }
        }
      }

      return newState
    default:
      return state
  }
}

let store = createStore(game)

let hand


store.dispatch({ type: INITIALIZE })


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_1).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0]]),
      otherPlayerCards: new Set()
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_2).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0]]),
      otherPlayerCards: new Set()
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_1).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0], hand[1]]),
      otherPlayerCards: new Set()
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_2).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0], hand[1]]),
      otherPlayerCards: new Set()
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_1).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0], hand[1], hand[2]]),
      otherPlayerCards: new Set([hand[0]])
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_2).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0], hand[1], hand[2]]),
      otherPlayerCards: new Set([hand[0]])
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_1).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0], hand[1], hand[2], hand[3]]),
      otherPlayerCards: new Set([hand[0], hand[1]])
    }
  }
})
console.log('----------')


console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))
hand = Array.from(handSelector(store.getState())(PLAYER_2).values())
store.dispatch({
  type: TURN,
  payload: {
    cards: {
      currentPlayerCards: new Set([hand[0], hand[1], hand[2], hand[3]]),
      otherPlayerCards: new Set([hand[0], hand[1]])
    }
  }
})
console.log('----------')

console.log(util.inspect(store.getState(), false, null))
console.log(currentFavourSelector(store.getState()))


console.log(player1CharmSelector(store.getState()))
console.log(player2CharmSelector(store.getState()))
console.log(player1GeishaSelector(store.getState()))
console.log(player2GeishaSelector(store.getState()))
console.log(winnerSelector(store.getState()))
console.log(turnSelector(store.getState()))
console.log(gameOverSelector(store.getState()))
