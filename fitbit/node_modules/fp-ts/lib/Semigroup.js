"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntercalateSemigroup = exports.semigroupVoid = exports.semigroupString = exports.semigroupProduct = exports.semigroupSum = exports.semigroupAny = exports.semigroupAll = exports.getObjectSemigroup = exports.getJoinSemigroup = exports.getMeetSemigroup = exports.getStructSemigroup = exports.getFunctionSemigroup = exports.getDualSemigroup = exports.getTupleSemigroup = exports.getLastSemigroup = exports.getFirstSemigroup = exports.fold = void 0;
/**
 * A `Semigroup` is a `Magma` where `concat` is associative, that is:
 *
 * Associativiy: `concat(concat(x, y), z) <-> concat(x, concat(y, z))`
 *
 * @since 2.0.0
 */
var function_1 = require("./function");
var Ord_1 = require("./Ord");
function fold(S) {
    return function (a, as) {
        if (as === undefined) {
            var foldS_1 = fold(S);
            return function (as) { return foldS_1(a, as); };
        }
        return as.reduce(S.concat, a);
    };
}
exports.fold = fold;
/**
 * @category instances
 * @since 2.0.0
 */
function getFirstSemigroup() {
    return { concat: function_1.identity };
}
exports.getFirstSemigroup = getFirstSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getLastSemigroup() {
    return { concat: function (_, y) { return y; } };
}
exports.getLastSemigroup = getLastSemigroup;
/**
 * Given a tuple of semigroups returns a semigroup for the tuple
 *
 * @example
 * import { getTupleSemigroup, semigroupString, semigroupSum, semigroupAll } from 'fp-ts/lib/Semigroup'
 *
 * const S1 = getTupleSemigroup(semigroupString, semigroupSum)
 * assert.deepStrictEqual(S1.concat(['a', 1], ['b', 2]), ['ab', 3])
 *
 * const S2 = getTupleSemigroup(semigroupString, semigroupSum, semigroupAll)
 * assert.deepStrictEqual(S2.concat(['a', 1, true], ['b', 2, false]), ['ab', 3, false])
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleSemigroup() {
    var semigroups = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        semigroups[_i] = arguments[_i];
    }
    return {
        concat: function (x, y) { return semigroups.map(function (s, i) { return s.concat(x[i], y[i]); }); }
    };
}
exports.getTupleSemigroup = getTupleSemigroup;
/**
 * The dual of a `Semigroup`, obtained by swapping the arguments of `concat`.
 *
 * @example
 * import { getDualSemigroup, semigroupString } from 'fp-ts/lib/Semigroup'
 *
 * assert.deepStrictEqual(getDualSemigroup(semigroupString).concat('a', 'b'), 'ba')
 *
 * @category instances
 * @since 2.0.0
 */
function getDualSemigroup(S) {
    return {
        concat: function (x, y) { return S.concat(y, x); }
    };
}
exports.getDualSemigroup = getDualSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionSemigroup(S) {
    return function () { return ({
        concat: function (f, g) { return function (a) { return S.concat(f(a), g(a)); }; }
    }); };
}
exports.getFunctionSemigroup = getFunctionSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getStructSemigroup(semigroups) {
    return {
        concat: function (x, y) {
            var r = {};
            for (var _i = 0, _a = Object.keys(semigroups); _i < _a.length; _i++) {
                var key = _a[_i];
                r[key] = semigroups[key].concat(x[key], y[key]);
            }
            return r;
        }
    };
}
exports.getStructSemigroup = getStructSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getMeetSemigroup(O) {
    return {
        concat: Ord_1.min(O)
    };
}
exports.getMeetSemigroup = getMeetSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getJoinSemigroup(O) {
    return {
        concat: Ord_1.max(O)
    };
}
exports.getJoinSemigroup = getJoinSemigroup;
/**
 * Returns a `Semigroup` instance for objects preserving their type
 *
 * @example
 * import { getObjectSemigroup } from 'fp-ts/lib/Semigroup'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * const S = getObjectSemigroup<Person>()
 * assert.deepStrictEqual(S.concat({ name: 'name', age: 23 }, { name: 'name', age: 24 }), { name: 'name', age: 24 })
 *
 * @category instances
 * @since 2.0.0
 */
function getObjectSemigroup() {
    return {
        concat: function (x, y) { return Object.assign({}, x, y); }
    };
}
exports.getObjectSemigroup = getObjectSemigroup;
/**
 * Boolean semigroup under conjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupAll = {
    concat: function (x, y) { return x && y; }
};
/**
 * Boolean semigroup under disjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupAny = {
    concat: function (x, y) { return x || y; }
};
/**
 * Number `Semigroup` under addition
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupSum = {
    concat: function (x, y) { return x + y; }
};
/**
 * Number `Semigroup` under multiplication
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupProduct = {
    concat: function (x, y) { return x * y; }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.semigroupString = {
    concat: function (x, y) { return x + y; }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.semigroupVoid = {
    concat: function () { return undefined; }
};
/**
 * You can glue items between and stay associative
 *
 * @example
 * import { getIntercalateSemigroup, semigroupString } from 'fp-ts/lib/Semigroup'
 *
 * const S = getIntercalateSemigroup(' ')(semigroupString)
 *
 * assert.strictEqual(S.concat('a', 'b'), 'a b')
 * assert.strictEqual(S.concat(S.concat('a', 'b'), 'c'), S.concat('a', S.concat('b', 'c')))
 *
 * @category instances
 * @since 2.5.0
 */
function getIntercalateSemigroup(a) {
    return function (S) { return ({
        concat: function (x, y) { return S.concat(x, S.concat(a, y)); }
    }); };
}
exports.getIntercalateSemigroup = getIntercalateSemigroup;
