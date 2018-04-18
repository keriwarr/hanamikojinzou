'use strict'

const {
  GEISHA,
  ALL_GEISHA
} = require('./constants.js')

const NUM_CARDS = 21
const LARGEST_CARD = 2 ** (NUM_CARDS - 1)

// unordered distinct subset of the 21 cards
class InternalCardSet {
  constructor (cards = []) {
    this.bitmap = 0

    cards.forEach(card => {
      if (!Number.isInteger(card) || card < 0 || card >= NUM_CARDS) {
        throw new Error('CardSet may only contain valid cards')
      }
      const cardBit = 2 ** card
      if ((this.bitmap & cardBit) !== 0) {
        throw new Error('duplicate cards passed to CardSet ctor')
      }

      this.bitmap |= cardBit
    })
  }

  get size () {
    let size = 0
    for (let card = 1; card <= LARGEST_CARD; card *= 2) {
      if ((this.bitmap & card) !== 0) {
        size += 1
      }
    }
    return size
  }

  get cards () {
    const cards = []
    for (let card = 1; card <= LARGEST_CARD; card *= 2) {
      if (((this.bitmap & card) !== 0)) {
        cards.push(card)
      }
    }
    return cards
  }

  forEach (fn) {
    for (let card = 0; card < NUM_CARDS; card++) {
      if ((this.bitmap & (2 ** card)) !== 0) {
        fn(card) // TODO: be more forEach interface compliant?
      }
    }
  }

  has (card) {
    return (this.bitmap & (2 ** card)) !== 0
  }

  hasOneOf (cards) {
    for (let i = 0; i < cards.length; i++) {
      if ((this.bitmap & (2 ** cards[i])) !== 0) {
        return true
      }
    }
    return false
  }

  isSubsetOf (other) {
    for (let card = 1; card <= LARGEST_CARD; card *= 2) {
      if (((this.bitmap & card) !== 0) && ((other.bitmap & card) === 0)) {
        return false
      }
    }
    return true
  }

  equals (other) {
    return this.bitmap === other.bitmap
  }

  isDisjointFrom (other) {
    for (let card = 1; card <= LARGEST_CARD; card *= 2) {
      if (((this.bitmap & card) !== 0) && ((other.bitmap & card) !== 0)) {
        return false
      }
    }
    return true
  }

  instersection (other) {
    const ics = new InternalCardSet()
    ics.bitmap = this.bitmap & other.bitmap
  }

  union (other) {
    const ics = new InternalCardSet()
    ics.bitmap = this.bitmap | other.bitmap
  }

  static union (...cardSets) {
    const newIcs = new InternalCardSet()
    cardSets.forEach(ics => {
      newIcs.bitmap = newIcs.bitmap | ics.bitmap
    })
    return newIcs
  }
}

const internalToExternalCard = card => {
  if (card >= 0 && card <= 1) return GEISHA.PURPLE_2
  else if (card >= 2 && card <= 3) return GEISHA.RED_2
  else if (card >= 4 && card <= 5) return GEISHA.YELLOW_2
  else if (card >= 6 && card <= 8) return GEISHA.BLUE_3
  else if (card >= 9 && card <= 11) return GEISHA.ORANGE_3
  else if (card >= 12 && card <= 15) return GEISHA.GREEN_4
  else if (card >= 16 && card <= 20) return GEISHA.PINK_5
  else throw new Error('invalid card number')
}

class CardSet {
  constructor (cards) {
    this.cardSet = new InternalCardSet(cards)
  }

  has (card) {
    switch (card) {
      case GEISHA.PURPLE_2:
        return this.cardSet.hasOneOf([0, 1])
      case GEISHA.RED_2:
        return this.cardSet.hasOneOf([2, 3])
      case GEISHA.YELLOW_2:
        return this.cardSet.hasOneOf([4, 5])
      case GEISHA.BLUE_3:
        return this.cardSet.hasOneOf([6, 7, 8])
      case GEISHA.ORANGE_3:
        return this.cardSet.hasOneOf([9, 10, 11])
      case GEISHA.GREEN_4:
        return this.cardSet.hasOneOf([12, 13, 14, 15])
      case GEISHA.PINK_5:
        return this.cardSet.hasOneOf([16, 17, 18, 19, 20])
      case GEISHA.UNKNOWN:
        return false
      default:
        throw new Error('invalid card number')
    }
  }

  forEachCard (fn) {
    this.cardSet.forEach(internalCard => {
      const externalCard = internalToExternalCard(internalCard)

      fn(externalCard, this.count(externalCard))
    })
  }

  forEachCardType (fn) {
    // TODO: precompute list of geisha
    ALL_GEISHA.filter(geisha => this.count(geisha) > 0).forEach(fn) // TODO: be more forEach interface compliant?
  }

  count (card) {
    switch (card) {
      case GEISHA.PURPLE_2:
        return this.cardSet.has(0) + this.cardSet.has(1) + 0
      case GEISHA.RED_2:
        return this.cardSet.has(2) + this.cardSet.has(3) + 0
      case GEISHA.YELLOW_2:
        return this.cardSet.has(4) + this.cardSet.has(5) + 0
      case GEISHA.BLUE_3:
        return this.cardSet.has(6) + this.cardSet.has(7) + this.cardSet.has(8) + 0
      case GEISHA.ORANGE_3:
        return this.cardSet.has(9) + this.cardSet.has(10) + this.cardSet.has(11) + 0
      case GEISHA.GREEN_4:
        return this.cardSet.has(12) + this.cardSet.has(13) + this.cardSet.has(14) + this.cardSet.has(15) + 0
      case GEISHA.PINK_5:
        return this.cardSet.has(16) + this.cardSet.has(17) + this.cardSet.has(18) + this.cardSet.has(19) + this.cardSet.has(20) + 0
      case GEISHA.UNKNOWN:
        return 0
      default:
        throw new Error('invalid card number')
    }
  }

  get cards () {
    const cards = {}
    ALL_GEISHA.forEach(geisha => {
      cards[geisha] = this.count(geisha)
    })
    return cards
  }
}

module.exports = {
  InternalCardSet,
  CardSet
}
