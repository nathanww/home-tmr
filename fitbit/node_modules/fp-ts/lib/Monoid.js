"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJoinMonoid = exports.getMeetMonoid = exports.getStructMonoid = exports.getEndomorphismMonoid = exports.getFunctionMonoid = exports.getDualMonoid = exports.getTupleMonoid = exports.fold = exports.monoidVoid = exports.monoidString = exports.monoidProduct = exports.monoidSum = exports.monoidAny = exports.monoidAll = void 0;
var function_1 = require("./function");
var Semigroup_1 = require("./Semigroup");
/**
 * Boolean monoid under conjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidAll = {
    concat: Semigroup_1.semigroupAll.concat,
    empty: true
};
/**
 * Boolean monoid under disjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidAny = {
    concat: Semigroup_1.semigroupAny.concat,
    empty: false
};
/**
 * Number monoid under addition
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidSum = {
    concat: Semigroup_1.semigroupSum.concat,
    empty: 0
};
/**
 * Number monoid under multiplication
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidProduct = {
    concat: Semigroup_1.semigroupProduct.concat,
    empty: 1
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.monoidString = {
    concat: Semigroup_1.semigroupString.concat,
    empty: ''
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.monoidVoid = {
    concat: Semigroup_1.semigroupVoid.concat,
    empty: undefined
};
/**
 * @since 2.0.0
 */
function fold(M) {
    var foldM = Semigroup_1.fold(M);
    return function (as) { return foldM(M.empty, as); };
}
exports.fold = fold;
/**
 * Given a tuple of monoids returns a monoid for the tuple
 *
 * @example
 * import { getTupleMonoid, monoidString, monoidSum, monoidAll } from 'fp-ts/lib/Monoid'
 *
 * const M1 = getTupleMonoid(monoidString, monoidSum)
 * assert.deepStrictEqual(M1.concat(['a', 1], ['b', 2]), ['ab', 3])
 *
 * const M2 = getTupleMonoid(monoidString, monoidSum, monoidAll)
 * assert.deepStrictEqual(M2.concat(['a', 1, true], ['b', 2, false]), ['ab', 3, false])
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleMonoid() {
    var monoids = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        monoids[_i] = arguments[_i];
    }
    return {
        concat: Semigroup_1.getTupleSemigroup.apply(void 0, monoids).concat,
        empty: monoids.map(function (m) { return m.empty; })
    };
}
exports.getTupleMonoid = getTupleMonoid;
/**
 * The dual of a `Monoid`, obtained by swapping the arguments of `concat`.
 *
 * @example
 * import { getDualMonoid, monoidString } from 'fp-ts/lib/Monoid'
 *
 * assert.deepStrictEqual(getDualMonoid(monoidString).concat('a', 'b'), 'ba')
 *
 * @category combinators
 * @since 2.0.0
 */
function getDualMonoid(M) {
    return {
        concat: Semigroup_1.getDualSemigroup(M).concat,
        empty: M.empty
    };
}
exports.getDualMonoid = getDualMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionMonoid(M) {
    return function () { return ({
        concat: Semigroup_1.getFunctionSemigroup(M)().concat,
        empty: function () { return M.empty; }
    }); };
}
exports.getFunctionMonoid = getFunctionMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getEndomorphismMonoid() {
    return {
        concat: function (x, y) { return function (a) { return x(y(a)); }; },
        empty: function_1.identity
    };
}
exports.getEndomorphismMonoid = getEndomorphismMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getStructMonoid(monoids) {
    var empty = {};
    for (var _i = 0, _a = Object.keys(monoids); _i < _a.length; _i++) {
        var key = _a[_i];
        empty[key] = monoids[key].empty;
    }
    return {
        concat: Semigroup_1.getStructSemigroup(monoids).concat,
        empty: empty
    };
}
exports.getStructMonoid = getStructMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getMeetMonoid(B) {
    return {
        concat: Semigroup_1.getMeetSemigroup(B).concat,
        empty: B.top
    };
}
exports.getMeetMonoid = getMeetMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getJoinMonoid(B) {
    return {
        concat: Semigroup_1.getJoinSemigroup(B).concat,
        empty: B.bottom
    };
}
exports.getJoinMonoid = getJoinMonoid;
