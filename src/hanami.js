const { createSelector } = require('reselect')

/****************************************************************************
 *                                  ENUMS                                   *
 ****************************************************************************/

const CARDS = Object.freeze({
  // UNKNOWN is used to represent card objects which aren't visible to a player
  // i.e. the contents of the other players hand
  UNKNOWN: -1,
  PURPLE_2: 0,
  RED_2: 1,
  YELLOW_2: 2,
  BLUE_3: 3,
  ORANGE_3: 4,
  GREEN_4: 5,
  PINK_5: 6
})

const PLAYERS = Object.freeze({
  '1': 0,
  '2': 1
})

const MOVES = Object.freeze({
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3
})

/****************************************************************************
 *                                 CONSTANTS                                *
 ****************************************************************************/

// The deck is modeled like this so that it can be represented as a Set() of unique elements.
// We're also taking advantage of the fact that the set is ordered though, which is kind of
// weird. Alternatives should be considered.
const DECK = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const CARD_TYPES = [
  CARDS.PURPLE_2,
  CARDS.RED_2,
  CARDS.YELLOW_2,
  CARDS.BLUE_3,
  CARDS.ORANGE_3,
  CARDS.GREEN_4,
  CARDS.PINK_5
]
const CARD_VALUE_MAP = { // i.e. How many of them exist, and how much the corresponding geisha's favour is worth
  [CARDS.PURPLE_2]: 2,
  [CARDS.RED_2]: 2,
  [CARDS.YELLOW_2]: 2,
  [CARDS.BLUE_3]: 3,
  [CARDS.ORANGE_3]: 3,
  [CARDS.GREEN_4]: 4,
  [CARDS.PINK_5]: 5
}
const FAVOUR_VALUES = CARD_TYPES.map(type => CARD_VALUE_MAP[type])
const CHARM_THRESHOLD = 11 // If you have this much charm at the end of the round, you win
const GEISHA_THRESHOLD = 4 // If you have the favour of this many geisha's at the end fo the round, you win
// FIXME: this is actually a bug:
// If the first player on their first turn plays move 3, this erroneously allows the second player to look
// at seven card rather than the correct 6
const STARTING_HAND_SIZE = 7
const MAX_HAND_SIZE = 10
const LAST_TURN = 7
const EXPECTED_OTHER_PLAYER_SELECTION_SIZE = { // move type to how many cards the opponet chooses
  [MOVES['1']]: 0,
  [MOVES['2']]: 0,
  [MOVES['3']]: 1,
  [MOVES['4']]: 2
}
const MOVE_SIZE_TO_MOVE_MAP = { // Number of cards to move type
  1: MOVES['1'],
  2: MOVES['2'],
  3: MOVES['3'],
  4: MOVES['4']
}
const ALL_MOVES = [
  MOVES['1'],
  MOVES['2'],
  MOVES['3'],
  MOVES['4']
]

/****************************************************************************
 *                                  UTILS                                   *
 ****************************************************************************/

const cardType = card => {
  if (card >= 0 && card <= 1) return CARDS.PURPLE_2
  else if (card >= 2 && card <= 3) return CARDS.RED_2
  else if (card >= 4 && card <= 5) return CARDS.YELLOW_2
  else if (card >= 6 && card <= 8) return CARDS.BLUE_3
  else if (card >= 9 && card <= 11) return CARDS.ORANGE_3
  else if (card >= 12 && card <= 15) return CARDS.GREEN_4
  else if (card >= 16 && card <= 20) return CARDS.PINK_5
  else throw new Error('ERROR: invalid card number')
}

const shuffle = arr => {
  let a = arr.slice() // Is this the best way to return a _new_ shuffled array? Though perhaps the call to new Set() is copying the data too so this isn't needed?
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

const getNewDeck = () => new Set(shuffle(DECK))

/****************************************************************************
 *                                SELECTORS                                 *
 ****************************************************************************/

const roundSelector = state => state.round
const favourSelector = state => state.favour
const deckSelector = state => state.deck
const movesSelector = state => state.moves

// Which, of the four kinds of moves has a player not taken this round
const availableMovesSelector = createSelector(
  movesSelector,
  moves => playerID => {
    const availableMoves = new Set()
    ALL_MOVES.forEach(move => {
      if (moves[playerID][move].self === null) availableMoves.add(move)
    })
    return availableMoves
  }
)

// How many turns in total have been taken this round
const turnSelector = createSelector(
  movesSelector,
  moves => moves[PLAYERS['1']].concat(moves[PLAYERS['2']]).reduce(
    (total, selection) => selection.self === null ? total : total + 1,
    0
  )
)

// Who's turn is it
const currentPlayerSelector = createSelector(
  roundSelector,
  turnSelector,
  (round, turn) => (round + turn) % 2
)

// All of the cards that you have ever drawn into your hand this round
const totalHandSelector = createSelector(
  turnSelector,
  deckSelector,
  (turn, deck) => playerID => {
    const start = playerID * MAX_HAND_SIZE
    const count = Math.floor(turn / 2) + STARTING_HAND_SIZE
    return new Set(Array.from(deck.values()).slice(start, start + count))
  }
)

// All of the cards which you have ever drawn into your hand and haven't played yet, this round
const handSelector = createSelector(
  totalHandSelector,
  movesSelector,
  (totalHand, moves) => playerID => {
    const playerTotalHand = totalHand(playerID)
    const hand = new Set(playerTotalHand)

    moves[playerID].forEach(move => {
      if (move.self) move.self.forEach(card => hand.delete(card))
    })

    return hand
  }
)

const handSizeSelector = createSelector(
  handSelector,
  hand => playerID => hand(playerID).size
)

// How favour would be allocated right now, according to the current distribution of item cards, and the existing favour
const currentFavourSelector = createSelector(
  movesSelector,
  favourSelector,
  (moves, favour) => {
    const player1Cards = new Set()
    const player2Cards = new Set()
    const player1ItemCount = {
      [CARDS.PURPLE_2]: 0,
      [CARDS.RED_2]: 0,
      [CARDS.YELLOW_2]: 0,
      [CARDS.BLUE_3]: 0,
      [CARDS.ORANGE_3]: 0,
      [CARDS.GREEN_4]: 0,
      [CARDS.PINK_5]: 0
    }
    const player2ItemCount = {
      [CARDS.PURPLE_2]: 0,
      [CARDS.RED_2]: 0,
      [CARDS.YELLOW_2]: 0,
      [CARDS.BLUE_3]: 0,
      [CARDS.ORANGE_3]: 0,
      [CARDS.GREEN_4]: 0,
      [CARDS.PINK_5]: 0
    }

    if (moves[PLAYERS['1']][MOVES['1']].self) {
      moves[PLAYERS['1']][MOVES['1']].self.forEach(card => player1Cards.add(card))
    }
    if (moves[PLAYERS['2']][MOVES['1']].self) {
      moves[PLAYERS['2']][MOVES['1']].self.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYERS['1']][MOVES['3']].self) {
      moves[PLAYERS['1']][MOVES['3']].self.forEach(card => player1Cards.add(card))
      moves[PLAYERS['1']][MOVES['3']].other.forEach(card => player1Cards.delete(card))
      moves[PLAYERS['1']][MOVES['3']].other.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYERS['2']][MOVES['3']].self) {
      moves[PLAYERS['2']][MOVES['3']].self.forEach(card => player2Cards.add(card))
      moves[PLAYERS['2']][MOVES['3']].other.forEach(card => player2Cards.delete(card))
      moves[PLAYERS['2']][MOVES['3']].other.forEach(card => player1Cards.add(card))
    }

    if (moves[PLAYERS['1']][MOVES['4']].self) {
      moves[PLAYERS['1']][MOVES['4']].self.forEach(card => player1Cards.add(card))
      moves[PLAYERS['1']][MOVES['4']].other.forEach(card => player1Cards.delete(card))
      moves[PLAYERS['1']][MOVES['4']].other.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYERS['2']][MOVES['4']].self) {
      moves[PLAYERS['2']][MOVES['4']].self.forEach(card => player2Cards.add(card))
      moves[PLAYERS['2']][MOVES['4']].other.forEach(card => player2Cards.delete(card))
      moves[PLAYERS['2']][MOVES['4']].other.forEach(card => player1Cards.add(card))
    }

    player1Cards.forEach(card => {
      player1ItemCount[cardType(card)] += 1
    })

    player2Cards.forEach(card => {
      player2ItemCount[cardType(card)] += 1
    })

    return CARD_TYPES.map((type, index) => {
      if (player1ItemCount[type] > player2ItemCount[type]) return PLAYERS['1']
      if (player2ItemCount[type] > player1ItemCount[type]) return PLAYERS['2']
      return favour[index]
    })
  }
)

const playerCharmSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => favour.map((player, index) => player === playerID ? FAVOUR_VALUES[index] : 0).reduce((a, b) => a + b, 0)
)
// How many charm points each player has
const player1CharmSelector = playerCharmSelectorCreator(PLAYERS['1'])
const player2CharmSelector = playerCharmSelectorCreator(PLAYERS['2'])

const playerGeishasSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => favour.map((player, index) => player === playerID ? 1 : 0).reduce((a, b) => a + b, 0)
)
// How many geishas each player has charmed
const player1GeishaSelector = playerGeishasSelectorCreator(PLAYERS['1'])
const player2GeishaSelector = playerGeishasSelectorCreator(PLAYERS['2'])

const winnerSelector = createSelector(
  player1CharmSelector,
  player2CharmSelector,
  player1GeishaSelector,
  player2GeishaSelector,
  (p1charm, p2charm, p1geisha, p2geisha) => {
    if (p1charm >= CHARM_THRESHOLD) return PLAYERS['1']
    else if (p2charm >= CHARM_THRESHOLD) return PLAYERS['2']
    else if (p1geisha >= GEISHA_THRESHOLD) return PLAYERS['1']
    else if (p2geisha >= GEISHA_THRESHOLD) return PLAYERS['2']
    else return null
  }
)

const roundOverSelector = createSelector(
  turnSelector,
  turn => turn > LAST_TURN
)

const gameOverSelector = createSelector(
  winnerSelector,
  winner => winner !== null
)

/****************************************************************************
 *                                 REDUCER                                  *
 ****************************************************************************/

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

const game = (state = initialState, action) => {
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
        const endOfRoundState = { ...newState,
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

exports.game = game

exports.handSelector = handSelector
exports.gameOverSelector = gameOverSelector
exports.currentPlayerSelector = currentPlayerSelector
exports.winnerSelector = winnerSelector
exports.availableMovesSelector = availableMovesSelector
exports.totalHandSelector = totalHandSelector
exports.handSizeSelector = handSizeSelector
exports.favourSelector = favourSelector
exports.roundSelector = roundSelector
exports.turnSelector = turnSelector
exports.playerCharmSelectorCreator = playerCharmSelectorCreator
exports.movesSelector = movesSelector

exports.cardType = cardType

exports.CARDS = CARDS
exports.PLAYERS = PLAYERS
exports.MOVES = MOVES
