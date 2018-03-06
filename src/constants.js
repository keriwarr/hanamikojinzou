'use strict'

const CARDS = Object.freeze({
  // UNKNOWN is used to represent card objects which aren't visible to a player
  // i.e. the contents of the other players hand
  PURPLE_2: 0,
  RED_2: 1,
  YELLOW_2: 2,
  BLUE_3: 3,
  ORANGE_3: 4,
  GREEN_4: 5,
  PINK_5: 6,
  UNKNOWN: -1
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

// The deck is modeled like this so that it can be represented as a Set() of unique elements.
// We're also taking advantage of the fact that the set is ordered though, which is kind of
// weird. Alternatives should be considered.
const DECK = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])

// i.e. How many of them exist, and how much the corresponding geisha's favour is worth
const CARD_VALUE_MAP = Object.freeze({
  [CARDS.PURPLE_2]: 2,
  [CARDS.RED_2]: 2,
  [CARDS.YELLOW_2]: 2,
  [CARDS.BLUE_3]: 3,
  [CARDS.ORANGE_3]: 3,
  [CARDS.GREEN_4]: 4,
  [CARDS.PINK_5]: 5
})

// If you have this much charm at the end of the round, you win
const CHARM_THRESHOLD = 11

// If you have the favour of this many geisha's at the end fo the round, you win
const GEISHA_THRESHOLD = 4

// FIXME: this is actually a bug:
// If the first player on their first turn plays move 3, this erroneously allows the second player to look
// at seven card rather than the correct 6
const STARTING_HAND_SIZE = 7

const MAX_HAND_SIZE = 10

const LAST_TURN = 7

// move type to how many cards the opponet chooses
const EXPECTED_OTHER_PLAYER_SELECTION_SIZE = Object.freeze({
  [MOVES['1']]: 0,
  [MOVES['2']]: 0,
  [MOVES['3']]: 1,
  [MOVES['4']]: 2
})

// Number of cards to move type
const MOVE_SIZE_TO_MOVE_MAP = Object.freeze({
  1: MOVES['1'],
  2: MOVES['2'],
  3: MOVES['3'],
  4: MOVES['4']
})

module.exports = {
  CARDS,
  PLAYERS,
  MOVES,
  DECK,
  CARD_VALUE_MAP,
  CHARM_THRESHOLD,
  GEISHA_THRESHOLD,
  STARTING_HAND_SIZE,
  MAX_HAND_SIZE,
  LAST_TURN,
  EXPECTED_OTHER_PLAYER_SELECTION_SIZE,
  MOVE_SIZE_TO_MOVE_MAP
}
