# HanamikoJinzou

This is an implementation of an Engine for Hanamikoji the card game.

At the moment, it supports running AI bots head to head with a fairly rudimentary API.

## Bot API

A bot is a function of the following form:

```javascript
const bot = api => ({
  getMove: () => {
    // ...
  },
  getMove3Response: cards => {
    // ...
  },
  getMove4Response: pairs => {
    // ...
  }
})
```

### `CardSet`

A CardSet is a data structure representing a collection of cards.

### `getMove() : () -> CardSet`
`getMove` is expected to return a `CardSet` that is a subset of your hand (itself a `CardSet`).
The move that you are making is inferred from the size of the returned `CardSet`.
Since a `CardSet` is ordered, when making Move 4, the specified pairs of cards are inferred to be the first card paired with the second card, and the third card paired witht the fourth card. This may change in the future.

### `getMove3Response() : CardSet -> Card`
`getMove3Response` is expected to return a single card taken from the given `CardSet`.

### `getMove4Response() : [CardSet, CardSet] -> CardSet`
`getMove4Response` is expected to return one of the two given `CardSet`s.

### `api`

A bot has access to the game state via a `api` object which it consumes. The `api` object contains a series of methods for accessing but not mutating the game state. `api` methods can thus be called from anywhere, and at anytime within the definition of the bot. Most or all of these calls are memoized.

#### `api.getHand() : () -> CardSet`

The collection of cards which you may choose from for your next move.

#### `api.getTotalHand() : () -> CardSet`

The set of all cards that you've ever drawn into your hand this round, including the ones that have already ben played.

#### `api.getAvailableMoves() : () -> Set(MOVE)`

A Set which is a subset of `Set([MOVE_1, MOVE_2, MOVE_3, MOVE_4])`, describing which moves you haven't taken yet this round

#### `api.getFavour() : () -> Array(PLAYER_1 | PLAYER_2 | null)`

The current allocation of favour, as of the beginning of the current round.

#### `api.getRound() : () -> Integer`

The current round number, starting at zero.

#### `api.getTurn() : () -> Integer`

The current turn number, starting at zero, up to seven (inclusive).

#### `api.getCharm() : () -> Integer`

The amount of charm that you are assigned by the current allocation of favour.

#### `api.getMoves() : () -> Array({self: CardSet, other?: CardSet})`

A description of the moves you have already made.

#### `api.getOpponentHandSize() : () -> Integer`

The number of cards in your opponents hand.

#### `api.getOpponentAvaiableMoves() : () -> Set(MOVE)`

The moves your opponents _hasn't_ played yet.

#### `api.getOpponentCharm() : () -> Integer`

The amonut of charm that your opponent is currently assigned.

#### `api.getOpponentMoves() : () -> Array({self: CardSet, other?: CardSet})`

A description of the moves your opponent has made. The cards which they played for moves 1 and 2 have been censored.

## TODO

- [ ] Abstract hands away into a class with a Set() as the internal state, but useful functions on top of that
- [ ] Tests?
- [ ] A web interface. Also - a way for humans to play (against AI for now). This would open up the door to taking advantage of some nice features of redux such as the time travelling debugger
- [ ] Make sure the engine is correct
- [ ] A selector for cards visibly played on either side of the board, or invisibly and visibly played on your side
- [ ] Create some mechanism whereby bots can explore potential changes to the game state
- [ ] Turn API methods into selectors, to take advantage fo memoization, where possible

## Performance

- Fix the selectors to always return data instead of sometimes a function
- Should we use a better memoizer?
- Profiling

## Contributing

- Please ensure that your editor is equipped with a [standard js plugin](https://standardjs.com/) for linting
