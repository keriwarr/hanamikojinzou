"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyBy = (array, iteratee) => Object.assign({}, ...array.map(elem => ({ [elem]: iteratee(elem) })));
exports.enumValues = (enumObject) => Object.values(enumObject);
exports.enumKeys = (enumObject) => Object.keys(enumObject);
