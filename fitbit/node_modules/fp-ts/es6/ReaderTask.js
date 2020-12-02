/**
 * @since 2.3.0
 */
import { identity, flow, pipe } from './function';
import * as R from './Reader';
import * as T from './Task';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.3.0
 */
export var fromTask = 
/*#__PURE__*/
R.of;
/**
 * @category constructors
 * @since 2.3.0
 */
export var fromReader = function (ma) { return flow(ma, T.of); };
/**
 * @category constructors
 * @since 2.3.0
 */
export var fromIO = 
/*#__PURE__*/
flow(T.fromIO, fromTask);
/**
 * @category constructors
 * @since 2.3.0
 */
export var ask = function () { return T.of; };
/**
 * @category constructors
 * @since 2.3.0
 */
export var asks = function (f) { return function (r) { return pipe(T.of(r), T.map(f)); }; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.3.0
 */
export var local = R.local;
/**
 * @category combinators
 * @since 2.4.0
 */
export function fromIOK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromIO(f.apply(void 0, a));
    };
}
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainIOK = function (f) {
    return chain(function (a) { return fromIO(f(a)); });
};
/**
 * @category combinators
 * @since 2.4.0
 */
export function fromTaskK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromTask(f.apply(void 0, a));
    };
}
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainTaskK = function (f) {
    return chain(function (a) { return fromTask(f(a)); });
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return pipe(fa, map(f)); };
var apPar_ = function (fab, fa) { return pipe(fab, ap(fa)); };
var apSeq_ = function (fab, fa) { return chain_(fab, function (f) { return map_(fa, f); }); };
var chain_ = function (ma, f) { return pipe(ma, chain(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.3.0
 */
export var map = function (f) { return function (fa) {
    return flow(fa, T.map(f));
}; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.3.0
 */
export var ap = function (fa) { return function (fab) { return function (r) { return pipe(fab(r), T.ap(fa(r))); }; }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.3.0
 */
export var apFirst = function (fb) { return function (fa) {
    return pipe(fa, map(function (a) { return function (_) { return a; }; }), ap(fb));
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.3.0
 */
export var apSecond = function (fb) { return function (fa) {
    return pipe(fa, map(function () { return function (b) { return b; }; }), ap(fb));
}; };
/**
 * @category Applicative
 * @since 2.3.0
 */
export var of = function (a) { return function () { return T.of(a); }; };
/**
 * Less strict version of  [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.7
 */
export var chainW = function (f) { return function (fa) { return function (r) {
    return pipe(fa(r), T.chain(function (a) { return f(a)(r); }));
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.3.0
 */
export var chain = chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.3.0
 */
export var chainFirst = function (f) {
    return chain(function (a) {
        return pipe(f(a), map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.3.0
 */
export var flatten = 
/*#__PURE__*/
chain(identity);
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.3.0
 */
export var URI = 'ReaderTask';
/**
 * @category instances
 * @since 2.3.0
 */
export function getSemigroup(S) {
    return R.getSemigroup(T.getSemigroup(S));
}
/**
 * @category instances
 * @since 2.3.0
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
export var ApplicativePar = {
    URI: URI,
    map: map_,
    ap: apPar_,
    of: of
};
/**
 * @category instances
 * @since 2.7.0
 */
export var ApplicativeSeq = {
    URI: URI,
    map: map_,
    ap: apSeq_,
    of: of
};
/**
 * @internal
 */
export var Monad = {
    URI: URI,
    map: map_,
    of: of,
    ap: apPar_,
    chain: chain_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
export var readerTask = {
    URI: URI,
    map: map_,
    of: of,
    ap: apPar_,
    chain: chain_,
    fromIO: fromIO,
    fromTask: fromTask
};
// TODO: remove in v3
/**
 * Like `readerTask` but `ap` is sequential
 *
 * @category instances
 * @since 2.3.0
 */
export var readerTaskSeq = {
    URI: URI,
    map: map_,
    of: of,
    ap: apSeq_,
    chain: chain_,
    fromIO: fromIO,
    fromTask: fromTask
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @since 2.4.0
 */
/* istanbul ignore next */
export function run(ma, r) {
    return ma(r)();
}
