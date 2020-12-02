"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bracket = exports.ioEither = exports.MonadThrow = exports.MonadIO = exports.Alt = exports.Monad = exports.Applicative = exports.Bifunctor = exports.Functor = exports.getFilterable = exports.getIOValidation = exports.getAltIOValidation = exports.getApplicativeIOValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.fromIO = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.apSecond = exports.apFirst = exports.ap = exports.mapLeft = exports.bimap = exports.map = exports.fromEither = exports.fromPredicate = exports.fromOption = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.filterOrElse = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.tryCatch = exports.leftIO = exports.rightIO = exports.right = exports.left = void 0;
var Apply_1 = require("./Apply");
var E = require("./Either");
var Filterable_1 = require("./Filterable");
var function_1 = require("./function");
var I = require("./IO");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = 
/*#__PURE__*/
function_1.flow(E.left, I.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = 
/*#__PURE__*/
function_1.flow(E.right, I.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightIO = 
/*#__PURE__*/
I.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftIO = 
/*#__PURE__*/
I.map(E.left);
/**
 * Constructs a new `IOEither` from a function that performs a side effect and might throw
 *
 * @category constructors
 * @since 2.0.0
 */
function tryCatch(f, onError) {
    return function () { return E.tryCatch(f, onError); };
}
exports.tryCatch = tryCatch;
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
exports.fold = 
/*#__PURE__*/
function_1.flow(E.fold, I.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) {
    return function_1.pipe(ma, I.chain(E.fold(onLeft, I.of)));
}; };
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
exports.orElse = function (f) {
    return I.chain(E.fold(f, exports.right));
};
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = 
/*#__PURE__*/
I.map(E.swap);
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) { return function (ma) {
    return function_1.pipe(ma, exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }));
}; };
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
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = function (ma) {
    return E.isLeft(ma) ? exports.left(ma.left) : exports.right(ma.right);
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var of = exports.right;
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
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
exports.map = function (f) { return I.map(E.map(f)); };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = function_1.flow(E.bimap, I.map);
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return I.map(E.mapLeft(f)); };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = 
/*#__PURE__*/
Apply_1.apComposition(I.Applicative, E.Applicative);
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
exports.chainW = function (f) { return function (ma) {
    return function_1.pipe(ma, I.chain(E.fold(exports.left, f)));
}; };
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
exports.flatten = exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) {
    return I.chain(E.fold(that, exports.right));
};
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = exports.rightIO;
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
exports.URI = 'IOEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return I.getSemigroup(E.getSemigroup(S));
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
    return I.getSemigroup(E.getApplySemigroup(S));
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
function getApplicativeIOValidation(SE) {
    var ap = Apply_1.apComposition(I.Applicative, E.getApplicativeValidation(SE));
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: of
    };
}
exports.getApplicativeIOValidation = getApplicativeIOValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltIOValidation(SE) {
    var A = E.getAltValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function () { return A.alt(me(), function () { return that()(); }); }; }
    };
}
exports.getAltIOValidation = getAltIOValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
function getIOValidation(SE) {
    var applicativeIOValidation = getApplicativeIOValidation(SE);
    var altIOValidation = getAltIOValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: applicativeIOValidation.ap,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altIOValidation.alt,
        fromIO: exports.fromIO,
        throwError: exports.throwError
    };
}
exports.getIOValidation = getIOValidation;
/**
 * @category instances
 * @since 2.1.0
 */
function getFilterable(M) {
    var W = E.getWitherable(M);
    var F = Filterable_1.getFilterableComposition(I.Monad, W);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: F.compact,
        separate: F.separate,
        filter: F.filter,
        filterMap: F.filterMap,
        partition: F.partition,
        partitionMap: F.partitionMap
    };
}
exports.getFilterable = getFilterable;
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
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
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
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadIO = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    fromIO: exports.fromIO
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
exports.ioEither = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    alt: alt_,
    fromIO: exports.fromIO,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.0
 */
exports.bracket = function (acquire, use, release) {
    return function_1.pipe(acquire, exports.chain(function (a) {
        return function_1.pipe(function_1.pipe(use(a), I.map(E.right)), exports.chain(function (e) {
            return function_1.pipe(release(a, e), exports.chain(function () { return (E.isLeft(e) ? exports.left(e.left) : of(e.right)); }));
        }));
    }));
};
