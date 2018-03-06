'use strict'

const { PLAYERS } = require('./constants.js')
const { simulation } = require('./api.js')
const {
  basicPlayer
  // hoard5sPlayer
} = require('./players.js')

const players = {
  [PLAYERS['1']]: basicPlayer,
  [PLAYERS['2']]: basicPlayer // It maybe be unclear that being P2 doesn't actually confer and advantage
}
const wins = {
  [PLAYERS['1']]: 0,
  [PLAYERS['2']]: 0
}

for (let i = 0; i < 10000; i += 1) {
  const firstPlayer = (i % 2) === 0 ? PLAYERS['1'] : PLAYERS['2']
  const secondPlayer = (i % 2) === 0 ? PLAYERS['2'] : PLAYERS['1'] // A fair trail.
  const result = simulation(players[firstPlayer], players[secondPlayer])

  if (result === firstPlayer) wins[firstPlayer] += 1
  if (result === secondPlayer) wins[secondPlayer] += 1
}

console.log(`Player 1 (${players[PLAYERS['1']].name}): ${wins[PLAYERS['1']]}`)
console.log(`Player 2 (${players[PLAYERS['2']].name}): ${wins[PLAYERS['2']]}`)
