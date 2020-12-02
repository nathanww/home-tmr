"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.ChainRec = exports.MonadIO = exports.Monad = exports.Applicative = exports.Functor = exports.getMonoid = exports.getSemigroup = exports.URI = exports.fromIO = exports.flatten = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = void 0;
var function_1 = require("./function");
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (ma, f) { return function () { return f(ma()); }; };
var ap_ = function (mab, ma) { return function () { return mab()(ma()); }; };
var chain_ = function (ma, f) { return function () { return f(ma())(); }; };
var chainRec_ = function (a, f) { return function () {
    var e = f(a)();
    while (e._tag === 'Left') {
        e = f(e.left)();
    }
    return e.right;
}; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) { return function (fa) {
    return ap_(map_(fa, function (a) { return function () { return a; }; }), fb);
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) { return function (fa) {
    return ap_(map_(fa, function () { return function (b) { return b; }; }), fb);
}; };
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function (a) { return function () { return a; }; };
/**
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) { return function (ma) {
    return chain_(ma, function (a) { return map_(f(a), function () { return a; }); });
}; };
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = function (mma) { return chain_(mma, function_1.identity); };
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = function_1.identity;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'IO';
/**
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return function () { return S.concat(x(), y()); }; }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: exports.of(M.empty)
    };
}
exports.getMonoid = getMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadIO = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    fromIO: exports.fromIO
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ChainRec = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    chain: chain_,
    chainRec: chainRec_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.io = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    fromIO: exports.fromIO,
    chainRec: chainRec_
};
