import { apComposition } from './Apply';
import { flow, identity, pipe } from './function';
import * as R from './Reader';
import * as T from './Task';
import * as TE from './TaskEither';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
export function left(e) {
    return fromTaskEither(TE.left(e));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var right = function (a) { return function () { return TE.right(a); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
export function rightTask(ma) {
    return fromTaskEither(TE.rightTask(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftTask(me) {
    return fromTaskEither(TE.leftTask(me));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromTaskEither = 
/*#__PURE__*/
R.of;
/**
 * @category constructors
 * @since 2.0.0
 */
export var rightReader = function (ma) { return function (r) {
    return TE.right(ma(r));
}; };
/**
 * @category constructors
 * @since 2.5.0
 */
export function leftReaderTask(me) {
    return function (r) { return TE.leftTask(me(r)); };
}
/**
 * @category constructors
 * @since 2.5.0
 */
export function rightReaderTask(ma) {
    return function (r) { return TE.rightTask(ma(r)); };
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftReader(me) {
    return function (r) { return TE.left(me(r)); };
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function fromIOEither(ma) {
    return fromTaskEither(TE.fromIOEither(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function fromReaderEither(ma) {
    return function (r) { return TE.fromEither(ma(r)); };
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function rightIO(ma) {
    return fromTaskEither(TE.rightIO(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftIO(me) {
    return fromTaskEither(TE.leftIO(me));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var ask = function () { return TE.right; };
/**
 * @category constructors
 * @since 2.0.0
 */
export var asks = function (f) { return function (r) {
    return pipe(TE.right(r), TE.map(f));
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromEither = function (ma) {
    return ma._tag === 'Left' ? left(ma.left) : right(ma.right);
};
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromOption = function (onNone) { return function (ma) { return (ma._tag === 'None' ? left(onNone()) : right(ma.value)); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
export function fold(onLeft, onRight) {
    return function (ma) { return function (r) {
        return pipe(ma(r), TE.fold(function (e) { return onLeft(e)(r); }, function (a) { return onRight(a)(r); }));
    }; };
}
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export var getOrElseW = function (onLeft) { return function (ma) { return function (r) {
    return TE.getOrElseW(function (e) { return onLeft(e)(r); })(ma(r));
}; }; };
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
export function orElse(onLeft) {
    return function (ma) { return function (r) { return TE.orElse(function (e) { return onLeft(e)(r); })(ma(r)); }; };
}
/**
 * @category combinators
 * @since 2.0.0
 */
export function swap(ma) {
    return function (e) { return TE.swap(ma(e)); };
}
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.0.0
 */
export var local = R.local;
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
 * @category combinators
 * @since 2.4.0
 */
export function fromIOEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromIOEither(f.apply(void 0, a));
    };
}
/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export var chainIOEitherKW = function (f) { return chainW(fromIOEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainIOEitherK = chainIOEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
export function fromTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromTaskEither(f.apply(void 0, a));
    };
}
/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export var chainTaskEitherKW = function (f) { return chainW(fromTaskEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainTaskEitherK = chainTaskEitherKW;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return pipe(fa, map(f)); };
var apPar_ = function (fab, fa) { return pipe(fab, ap(fa)); };
var apSeq_ = function (fab, fa) { return chain_(fab, function (f) { return map_(fa, f); }); };
var chain_ = function (ma, f) { return pipe(ma, chain(f)); };
var alt_ = function (fa, that) { return function (r) {
    return pipe(fa(r), TE.alt(function () { return that()(r); }));
}; };
var bimap_ = function (ma, f, g) { return function (e) { return pipe(ma(e), TE.bimap(f, g)); }; };
var mapLeft_ = function (ma, f) { return function (e) { return pipe(ma(e), TE.mapLeft(f)); }; };
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
export var map = function (f) { return function (fa) { return flow(fa, TE.map(f)); }; };
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var bimap = function (f, g) { return function (fa) { return bimap_(fa, f, g); }; };
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var mapLeft = function (f) { return function (fa) { return mapLeft_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = function (fa) { return function (fab) { return function (r) {
    return pipe(fab(r), TE.ap(fa(r)));
}; }; };
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
 * @category Applicative
 * @since 2.7.0
 */
export var of = right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export var chainW = function (f) { return function (fa) { return function (r) {
    return pipe(fa(r), TE.chainW(function (a) { return f(a)(r); }));
}; }; };
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
export var flatten = 
/*#__PURE__*/
chain(identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export var alt = function (that) { return function (fa) { return alt_(fa, that); }; };
/**
 * @category MonadIO
 * @since 2.0.0
 */
export var fromIO = rightIO;
/**
 * @category MonadTask
 * @since 2.0.0
 */
export var fromTask = rightTask;
/**
 * @category MonadThrow
 * @since 2.0.0
 */
export var throwError = left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
export var URI = 'ReaderTaskEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getSemigroup(S) {
    return R.getSemigroup(TE.getSemigroup(S));
}
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getApplySemigroup(S) {
    return R.getSemigroup(TE.getApplySemigroup(S));
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
export function getApplicativeReaderTaskValidation(A, SE) {
    var ap = apComposition(R.Applicative, TE.getApplicativeTaskValidation(A, SE));
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
export function getAltReaderTaskValidation(SE) {
    var A = TE.getAltTaskValidation(SE);
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function (r) { return A.alt(me(r), function () { return that()(r); }); }; }
    };
}
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
export function getReaderTaskValidation(SE) {
    var applicativeReaderTaskValidation = getApplicativeReaderTaskValidation(T.ApplicativePar, SE);
    var altReaderTaskValidation = getAltReaderTaskValidation(SE);
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        ap: applicativeReaderTaskValidation.ap,
        alt: altReaderTaskValidation.alt,
        fromIO: fromIO,
        fromTask: fromTask,
        throwError: throwError
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
export var Alt = {
    URI: URI,
    map: map_,
    alt: alt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export var readerTaskEither = {
    URI: URI,
    map: map_,
    of: of,
    ap: apPar_,
    chain: chain_,
    alt: alt_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    fromIO: fromIO,
    fromTask: fromTask,
    throwError: throwError
};
// TODO: remove in v3
/**
 * Like `readerTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
export var readerTaskEitherSeq = {
    URI: URI,
    map: map_,
    of: of,
    ap: apSeq_,
    chain: chain_,
    alt: alt_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    fromIO: fromIO,
    fromTask: fromTask,
    throwError: throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @since 2.0.0
 */
/* istanbul ignore next */
export function run(ma, r) {
    return ma(r)();
}
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.4
 */
export function bracket(aquire, use, release) {
    return function (r) {
        return TE.bracket(aquire(r), function (a) { return use(a)(r); }, function (a, e) { return release(a, e)(r); });
    };
}
