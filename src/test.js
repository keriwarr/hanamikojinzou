const {
  PLAYER_1,
  PLAYER_2
} = require('./hanami.js')
const { simulation } = require('./api.js')
const {
  basicPlayer
  // hoard5sPlayer
} = require('./players.js')

const players = {
  [PLAYER_1]: basicPlayer,
  [PLAYER_2]: basicPlayer // It maybe be unclear that being P2 doesn't actually confer and advantage
}
const wins = {
  [PLAYER_1]: 0,
  [PLAYER_2]: 0
}

for (let i = 0; i < 10000; i += 1) {
  const firstPlayer = (i % 2) === 0 ? PLAYER_1 : PLAYER_2
  const secondPlayer = (i % 2) === 0 ? PLAYER_2 : PLAYER_1 // A fair trail.
  const result = simulation(players[firstPlayer], players[secondPlayer])

  if (result === firstPlayer) wins[firstPlayer] += 1
  if (result === secondPlayer) wins[secondPlayer] += 1
}

console.log(`Player 1 (${players[PLAYER_1].name}): ${wins[PLAYER_1]}`)
console.log(`Player 2 (${players[PLAYER_2].name}): ${wins[PLAYER_2]}`)
