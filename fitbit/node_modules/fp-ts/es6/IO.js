import { identity } from './function';
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
export var map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apFirst = function (fb) { return function (fa) {
    return ap_(map_(fa, function (a) { return function () { return a; }; }), fb);
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apSecond = function (fb) { return function (fa) {
    return ap_(map_(fa, function () { return function (b) { return b; }; }), fb);
}; };
/**
 * @category Applicative
 * @since 2.0.0
 */
export var of = function (a) { return function () { return a; }; };
/**
 * @category Monad
 * @since 2.0.0
 */
export var chain = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export var chainFirst = function (f) { return function (ma) {
    return chain_(ma, function (a) { return map_(f(a), function () { return a; }); });
}; };
/**
 * @category Monad
 * @since 2.0.0
 */
export var flatten = function (mma) { return chain_(mma, identity); };
/**
 * @category MonadIO
 * @since 2.7.0
 */
export var fromIO = identity;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
export var URI = 'IO';
/**
 * @category instances
 * @since 2.0.0
 */
export function getSemigroup(S) {
    return {
        concat: function (x, y) { return function () { return S.concat(x(), y()); }; }
    };
}
/**
 * @category instances
 * @since 2.0.0
 */
export function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: of(M.empty)
    };
}
/**
 * @category instances
 * @since 2.7.0
 */
export var Functor = {
    URI: URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Applicative = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Monad = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var MonadIO = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    fromIO: fromIO
};
/**
 * @category instances
 * @since 2.7.0
 */
export var ChainRec = {
    URI: URI,
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
export var io = {
    URI: URI,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    fromIO: fromIO,
    chainRec: chainRec_
};
