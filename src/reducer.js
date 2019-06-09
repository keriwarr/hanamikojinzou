"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HanamikojiActionType;
(function (HanamikojiActionType) {
    HanamikojiActionType["TAKE_TURN"] = "TAKE_TURN";
})(HanamikojiActionType || (HanamikojiActionType = {}));
function takeTurn() {
    return {
        type: HanamikojiActionType.TAKE_TURN,
        payload: {
            foo: "a"
        }
    };
}
exports.takeTurn = takeTurn;
const initialState = {
    foo: ""
};
function hanamikojiReducer(state = initialState, action) {
    switch (action.type) {
        case HanamikojiActionType.TAKE_TURN:
            return {
                foo: action.payload.foo
            };
        default:
            return state;
    }
}
exports.hanamikojiReducer = hanamikojiReducer;
