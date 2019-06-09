"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const typescript_memoize_1 = require("typescript-memoize");
var PLAYER;
(function (PLAYER) {
    PLAYER[PLAYER["FIRST"] = 1] = "FIRST";
    PLAYER[PLAYER["SECOND"] = 2] = "SECOND";
})(PLAYER = exports.PLAYER || (exports.PLAYER = {}));
var MOVE;
(function (MOVE) {
    MOVE[MOVE["SECRET"] = 1] = "SECRET";
    MOVE[MOVE["TRADEOFF"] = 2] = "TRADEOFF";
    MOVE[MOVE["GIFT"] = 3] = "GIFT";
    MOVE[MOVE["COMPETITION"] = 4] = "COMPETITION";
})(MOVE = exports.MOVE || (exports.MOVE = {}));
exports.ALL_MOVES = utils_1.enumValues(MOVE);
// If you have this much charm at the end of the round, you win
exports.CHARM_THRESHOLD = 11;
// If you have the favour of this many geisha's at the end of the round, you win
exports.GEISHA_THRESHOLD = 4;
exports.STARTING_HAND_SIZE = 6;
exports.MAX_HAND_SIZE = 10;
exports.LAST_TURN = 7;
var GEISHA_KEY;
(function (GEISHA_KEY) {
    // UNKNOWN is used to represent card objects which aren't visible to a player
    // i.e. the contents of the other players hand
    GEISHA_KEY["UNKNOWN"] = "UNKNOWN";
    GEISHA_KEY["PURPLE_2"] = "PURPLE_2";
    GEISHA_KEY["RED_2"] = "RED_2";
    GEISHA_KEY["YELLOW_2"] = "YELLOW_2";
    GEISHA_KEY["BLUE_3"] = "BLUE_3";
    GEISHA_KEY["ORANGE_3"] = "ORANGE_3";
    GEISHA_KEY["GREEN_4"] = "GREEN_4";
    GEISHA_KEY["PINK_5"] = "PINK_5";
})(GEISHA_KEY || (GEISHA_KEY = {}));
const GEISHA_KEYS = utils_1.enumValues(GEISHA_KEY);
const GEISHA = {
    [GEISHA_KEY.UNKNOWN]: { value: 0 },
    [GEISHA_KEY.PURPLE_2]: { value: 2 },
    [GEISHA_KEY.RED_2]: { value: 2 },
    [GEISHA_KEY.YELLOW_2]: { value: 2 },
    [GEISHA_KEY.BLUE_3]: { value: 3 },
    [GEISHA_KEY.ORANGE_3]: { value: 3 },
    [GEISHA_KEY.GREEN_4]: { value: 4 },
    [GEISHA_KEY.PINK_5]: { value: 5 }
};
var CARD_KEY;
(function (CARD_KEY) {
    CARD_KEY["CARD1"] = "CARD1";
    CARD_KEY["CARD2"] = "CARD2";
    CARD_KEY["CARD3"] = "CARD3";
    CARD_KEY["CARD4"] = "CARD4";
    CARD_KEY["CARD5"] = "CARD5";
    CARD_KEY["CARD6"] = "CARD6";
    CARD_KEY["CARD7"] = "CARD7";
    CARD_KEY["CARD8"] = "CARD8";
    CARD_KEY["CARD9"] = "CARD9";
    CARD_KEY["CARD10"] = "CARD10";
    CARD_KEY["CARD11"] = "CARD11";
    CARD_KEY["CARD12"] = "CARD12";
    CARD_KEY["CARD13"] = "CARD13";
    CARD_KEY["CARD14"] = "CARD14";
    CARD_KEY["CARD15"] = "CARD15";
    CARD_KEY["CARD16"] = "CARD16";
    CARD_KEY["CARD17"] = "CARD17";
    CARD_KEY["CARD18"] = "CARD18";
    CARD_KEY["CARD19"] = "CARD19";
    CARD_KEY["CARD20"] = "CARD20";
    CARD_KEY["CARD21"] = "CARD21";
})(CARD_KEY || (CARD_KEY = {}));
const CARD_KEYS = utils_1.enumValues(CARD_KEY);
const CARD = {
    [CARD_KEY.CARD1]: { geisha: GEISHA_KEY.PURPLE_2 },
    [CARD_KEY.CARD2]: { geisha: GEISHA_KEY.PURPLE_2 },
    [CARD_KEY.CARD3]: { geisha: GEISHA_KEY.RED_2 },
    [CARD_KEY.CARD4]: { geisha: GEISHA_KEY.RED_2 },
    [CARD_KEY.CARD5]: { geisha: GEISHA_KEY.YELLOW_2 },
    [CARD_KEY.CARD6]: { geisha: GEISHA_KEY.YELLOW_2 },
    [CARD_KEY.CARD7]: { geisha: GEISHA_KEY.BLUE_3 },
    [CARD_KEY.CARD8]: { geisha: GEISHA_KEY.BLUE_3 },
    [CARD_KEY.CARD9]: { geisha: GEISHA_KEY.BLUE_3 },
    [CARD_KEY.CARD10]: { geisha: GEISHA_KEY.ORANGE_3 },
    [CARD_KEY.CARD11]: { geisha: GEISHA_KEY.ORANGE_3 },
    [CARD_KEY.CARD12]: { geisha: GEISHA_KEY.ORANGE_3 },
    [CARD_KEY.CARD13]: { geisha: GEISHA_KEY.GREEN_4 },
    [CARD_KEY.CARD14]: { geisha: GEISHA_KEY.GREEN_4 },
    [CARD_KEY.CARD15]: { geisha: GEISHA_KEY.GREEN_4 },
    [CARD_KEY.CARD16]: { geisha: GEISHA_KEY.GREEN_4 },
    [CARD_KEY.CARD17]: { geisha: GEISHA_KEY.PINK_5 },
    [CARD_KEY.CARD18]: { geisha: GEISHA_KEY.PINK_5 },
    [CARD_KEY.CARD19]: { geisha: GEISHA_KEY.PINK_5 },
    [CARD_KEY.CARD20]: { geisha: GEISHA_KEY.PINK_5 },
    [CARD_KEY.CARD21]: { geisha: GEISHA_KEY.PINK_5 }
};
class Card {
    constructor(key) {
        this.key = key;
        const card = CARD[key];
        this.geishaKey = card.geisha;
    }
    get geisha() {
        return Geisha.map[this.geishaKey];
    }
}
Card.map = utils_1.keyBy(CARD_KEYS, key => new Card(key));
Card.all = utils_1.enumValues(Card.map);
exports.Card = Card;
class Geisha {
    constructor(key) {
        this.key = key;
        const geisha = GEISHA[key];
        this._value = geisha.value;
        this.cardKeys = CARD_KEYS.filter(cardKey => CARD[cardKey].geisha === key);
    }
    get value() {
        return this._value;
    }
    get count() {
        return this._value;
    }
    get cards() {
        return Card.all.filter(card => this.cardKeys.includes(card.key));
    }
}
Geisha.map = utils_1.keyBy(GEISHA_KEYS, key => new Geisha(key));
Geisha.all = utils_1.enumValues(Card.map);
__decorate([
    typescript_memoize_1.Memoize(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Geisha.prototype, "cards", null);
exports.Geisha = Geisha;
