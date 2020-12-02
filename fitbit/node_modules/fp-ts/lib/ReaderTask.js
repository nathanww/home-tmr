"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.readerTaskSeq = exports.readerTask = exports.Monad = exports.ApplicativeSeq = exports.ApplicativePar = exports.Functor = exports.getMonoid = exports.getSemigroup = exports.URI = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.chainTaskK = exports.fromTaskK = exports.chainIOK = exports.fromIOK = exports.local = exports.asks = exports.ask = exports.fromIO = exports.fromReader = exports.fromTask = void 0;
/**
 * @since 2.3.0
 */
var function_1 = require("./function");
var R = require("./Reader");
var T = require("./Task");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.3.0
 */
exports.fromTask = 
/*#__PURE__*/
R.of;
/**
 * @category constructors
 * @since 2.3.0
 */
exports.fromReader = function (ma) { return function_1.flow(ma, T.of); };
/**
 * @category constructors
 * @since 2.3.0
 */
exports.fromIO = 
/*#__PURE__*/
function_1.flow(T.fromIO, exports.fromTask);
/**
 * @category constructors
 * @since 2.3.0
 */
exports.ask = function () { return T.of; };
/**
 * @category constructors
 * @since 2.3.0
 */
exports.asks = function (f) { return function (r) { return function_1.pipe(T.of(r), T.map(f)); }; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.3.0
 */
exports.local = R.local;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromIOK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromIO(f.apply(void 0, a));
    };
}
exports.fromIOK = fromIOK;
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainIOK = function (f) {
    return exports.chain(function (a) { return exports.fromIO(f(a)); });
};
/**
 * @category combinators
 * @since 2.4.0
 */
function fromTaskK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromTask(f.apply(void 0, a));
    };
}
exports.fromTaskK = fromTaskK;
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainTaskK = function (f) {
    return exports.chain(function (a) { return exports.fromTask(f(a)); });
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var apPar_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var apSeq_ = function (fab, fa) { return chain_(fab, function (f) { return map_(fa, f); }); };
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.3.0
 */
exports.map = function (f) { return function (fa) {
    return function_1.flow(fa, T.map(f));
}; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.3.0
 */
exports.ap = function (fa) { return function (fab) { return function (r) { return function_1.pipe(fab(r), T.ap(fa(r))); }; }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.3.0
 */
exports.apFirst = function (fb) { return function (fa) {
    return function_1.pipe(fa, exports.map(function (a) { return function (_) { return a; }; }), exports.ap(fb));
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.3.0
 */
exports.apSecond = function (fb) { return function (fa) {
    return function_1.pipe(fa, exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
}; };
/**
 * @category Applicative
 * @since 2.3.0
 */
exports.of = function (a) { return function () { return T.of(a); }; };
/**
 * Less strict version of  [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.7
 */
exports.chainW = function (f) { return function (fa) { return function (r) {
    return function_1.pipe(fa(r), T.chain(function (a) { return f(a)(r); }));
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.3.0
 */
exports.chain = exports.chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.3.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.3.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.3.0
 */
exports.URI = 'ReaderTask';
/**
 * @category instances
 * @since 2.3.0
 */
function getSemigroup(S) {
    return R.getSemigroup(T.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.3.0
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
exports.ApplicativePar = {
    URI: exports.URI,
    map: map_,
    ap: apPar_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativeSeq = {
    URI: exports.URI,
    map: map_,
    ap: apSeq_,
    of: exports.of
};
/**
 * @internal
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
exports.readerTask = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask
};
// TODO: remove in v3
/**
 * Like `readerTask` but `ap` is sequential
 *
 * @category instances
 * @since 2.3.0
 */
exports.readerTaskSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apSeq_,
    chain: chain_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @since 2.4.0
 */
/* istanbul ignore next */
function run(ma, r) {
    return ma(r)();
}
exports.run = run;
