"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerEither = exports.MonadThrow = exports.Alt = exports.Bifunctor = exports.Monad = exports.Applicative = exports.Functor = exports.getReaderValidation = exports.getAltReaderValidation = exports.getApplicativeReaderValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.apSecond = exports.apFirst = exports.ap = exports.mapLeft = exports.bimap = exports.map = exports.filterOrElse = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.local = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.asks = exports.ask = exports.leftReader = exports.rightReader = exports.right = exports.left = void 0;
var Apply_1 = require("./Apply");
var E = require("./Either");
var function_1 = require("./function");
var R = require("./Reader");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = function_1.flow(E.left, R.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = function_1.flow(E.right, R.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightReader = 
/*#__PURE__*/
R.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftReader = 
/*#__PURE__*/
R.map(E.left);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.ask = function () { return E.right; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.asks = function (f) { return function_1.flow(f, E.right); };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = function (ma) {
    return E.isLeft(ma) ? exports.left(ma.left) : exports.right(ma.right);
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
exports.fold = function_1.flow(E.fold, R.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) { return function_1.pipe(ma, R.chain(E.fold(onLeft, R.of))); }; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
exports.orElse = function (f) { return R.chain(E.fold(f, exports.right)); };
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = 
/*#__PURE__*/
R.map(E.swap);
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.0.0
 */
function local(f) {
    return function (ma) { return function (q) { return ma(f(q)); }; };
}
exports.local = local;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromEither(f.apply(void 0, a));
    };
}
exports.fromEitherK = fromEitherK;
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainEitherKW = function (f) { return exports.chainW(fromEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainEitherK = exports.chainEitherKW;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) { return function (ma) {
    return function_1.pipe(ma, exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }));
}; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var of = exports.right;
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) {
    return R.map(E.map(f));
};
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = 
/*#__PURE__*/
function_1.flow(E.bimap, R.map);
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) {
    return R.map(E.mapLeft(f));
};
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = 
/*#__PURE__*/
Apply_1.apComposition(R.Applicative, E.Applicative);
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) { return function (fa) {
    return function_1.pipe(fa, exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) { return function (fa) {
    return function_1.pipe(fa, exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
}; };
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) { return function_1.pipe(ma, R.chain(E.fold(exports.left, f))); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return R.chain(E.fold(that, exports.right)); };
/**
 * @category MonadThrow
 * @since 2.7.0
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'ReaderEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return R.getSemigroup(E.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return R.getSemigroup(E.getApplySemigroup(S));
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeReaderValidation(SE) {
    var ap = Apply_1.apComposition(R.Applicative, E.getApplicativeValidation(SE));
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: of
    };
}
exports.getApplicativeReaderValidation = getApplicativeReaderValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltReaderValidation(SE) {
    var A = E.getAltValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function (r) { return A.alt(me(r), function () { return that()(r); }); }; }
    };
}
exports.getAltReaderValidation = getAltReaderValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
function getReaderValidation(SE) {
    var applicativeReaderValidation = getApplicativeReaderValidation(SE);
    var altReaderValidation = getAltReaderValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: applicativeReaderValidation.ap,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altReaderValidation.alt,
        throwError: exports.throwError
    };
}
exports.getReaderValidation = getReaderValidation;
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
    of: of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.readerEither = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    alt: alt_,
    throwError: exports.left
};
