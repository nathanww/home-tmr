import { apComposition } from './Apply';
import * as E from './Either';
import { getFilterableComposition } from './Filterable';
import { flow, identity, pipe } from './function';
import * as I from './IO';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
export var left = 
/*#__PURE__*/
flow(E.left, I.of);
/**
 * @category constructors
 * @since 2.0.0
 */
export var right = 
/*#__PURE__*/
flow(E.right, I.of);
/**
 * @category constructors
 * @since 2.0.0
 */
export var rightIO = 
/*#__PURE__*/
I.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
export var leftIO = 
/*#__PURE__*/
I.map(E.left);
/**
 * Constructs a new `IOEither` from a function that performs a side effect and might throw
 *
 * @category constructors
 * @since 2.0.0
 */
export function tryCatch(f, onError) {
    return function () { return E.tryCatch(f, onError); };
}
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
export var fold = 
/*#__PURE__*/
flow(E.fold, I.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export var getOrElseW = function (onLeft) { return function (ma) {
    return pipe(ma, I.chain(E.fold(onLeft, I.of)));
}; };
/**
 * @category destructors
 * @since 2.0.0
 */
export var getOrElse = getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
export var orElse = function (f) {
    return I.chain(E.fold(f, right));
};
/**
 * @category combinators
 * @since 2.0.0
 */
export var swap = 
/*#__PURE__*/
I.map(E.swap);
/**
 * @category combinators
 * @since 2.0.0
 */
export var filterOrElse = function (predicate, onFalse) { return function (ma) {
    return pipe(ma, chain(function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); }));
}; };
/**
 * @category combinators
 * @since 2.4.0
 */
export function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromEither(f.apply(void 0, a));
    };
}
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export var chainEitherKW = function (f) { return chainW(fromEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainEitherK = chainEitherKW;
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? left(onNone()) : right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromEither = function (ma) {
    return E.isLeft(ma) ? left(ma.left) : right(ma.right);
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return pipe(fa, map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return pipe(fab, ap(fa)); };
var of = right;
/* istanbul ignore next */
var chain_ = function (ma, f) { return pipe(ma, chain(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return pipe(fa, bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return pipe(fa, mapLeft(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return pipe(fa, alt(that)); };
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
export var map = function (f) { return I.map(E.map(f)); };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var bimap = flow(E.bimap, I.map);
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var mapLeft = function (f) { return I.map(E.mapLeft(f)); };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = 
/*#__PURE__*/
apComposition(I.Applicative, E.Applicative);
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apFirst = function (fb) { return function (fa) {
    return pipe(fa, map(function (a) { return function () { return a; }; }), ap(fb));
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apSecond = function (fb) { return function (fa) {
    return pipe(fa, map(function () { return function (b) { return b; }; }), ap(fb));
}; };
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export var chainW = function (f) { return function (ma) {
    return pipe(ma, I.chain(E.fold(left, f)));
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export var chain = chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export var chainFirst = function (f) {
    return chain(function (a) {
        return pipe(f(a), map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
export var flatten = chain(identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export var alt = function (that) {
    return I.chain(E.fold(that, right));
};
/**
 * @category MonadIO
 * @since 2.7.0
 */
export var fromIO = rightIO;
/**
 * @category MonadThrow
 * @since 2.7.0
 */
export var throwError = left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
export var URI = 'IOEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getSemigroup(S) {
    return I.getSemigroup(E.getSemigroup(S));
}
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getApplySemigroup(S) {
    return I.getSemigroup(E.getApplySemigroup(S));
}
/**
 * @category instances
 * @since 2.0.0
 */
export function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: right(M.empty)
    };
}
/**
 * @category instances
 * @since 2.7.0
 */
export function getApplicativeIOValidation(SE) {
    var ap = apComposition(I.Applicative, E.getApplicativeValidation(SE));
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return pipe(fab, ap(fa)); },
        of: of
    };
}
/**
 * @category instances
 * @since 2.7.0
 */
export function getAltIOValidation(SE) {
    var A = E.getAltValidation(SE);
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function () { return A.alt(me(), function () { return that()(); }); }; }
    };
}
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export function getIOValidation(SE) {
    var applicativeIOValidation = getApplicativeIOValidation(SE);
    var altIOValidation = getAltIOValidation(SE);
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        ap: applicativeIOValidation.ap,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altIOValidation.alt,
        fromIO: fromIO,
        throwError: throwError
    };
}
/**
 * @category instances
 * @since 2.1.0
 */
export function getFilterable(M) {
    var W = E.getWitherable(M);
    var F = getFilterableComposition(I.Monad, W);
    return {
        URI: URI,
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
export var Bifunctor = {
    URI: URI,
    bimap: bimap_,
    mapLeft: mapLeft_
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
export var Alt = {
    URI: URI,
    map: map_,
    alt: alt_
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
export var MonadThrow = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    throwError: throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export var ioEither = {
    URI: URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    alt: alt_,
    fromIO: fromIO,
    throwError: throwError
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
export var bracket = function (acquire, use, release) {
    return pipe(acquire, chain(function (a) {
        return pipe(pipe(use(a), I.map(E.right)), chain(function (e) {
            return pipe(release(a, e), chain(function () { return (E.isLeft(e) ? left(e.left) : of(e.right)); }));
        }));
    }));
};
