import { apComposition } from './Apply';
import * as E from './Either';
import { getFilterableComposition } from './Filterable';
import { flow, identity, pipe } from './function';
import * as T from './Task';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
export var left = 
/*#__PURE__*/
flow(E.left, T.of);
/**
 * @category constructors
 * @since 2.0.0
 */
export var right = 
/*#__PURE__*/
flow(E.right, T.of);
/**
 * @category constructors
 * @since 2.0.0
 */
export var rightIO = function (ma) { return rightTask(T.fromIO(ma)); };
/**
 * @category constructors
 * @since 2.0.0
 */
export var leftIO = function (me) { return leftTask(T.fromIO(me)); };
/**
 * @category constructors
 * @since 2.0.0
 */
export var rightTask = 
/*#__PURE__*/
T.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
export var leftTask = 
/*#__PURE__*/
T.map(E.left);
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromIOEither = T.fromIO;
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromEither = function (ma) {
    return E.isLeft(ma) ? left(ma.left) : right(ma.right);
};
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
 * Transforms a `Promise` that may reject to a `Promise` that never rejects and returns an `Either` instead.
 *
 * Note: `f` should never `throw` errors, they are not caught.
 *
 * @example
 * import { left, right } from 'fp-ts/lib/Either'
 * import { tryCatch } from 'fp-ts/lib/TaskEither'
 *
 * tryCatch(() => Promise.resolve(1), String)().then(result => {
 *   assert.deepStrictEqual(result, right(1))
 * })
 * tryCatch(() => Promise.reject('error'), String)().then(result => {
 *   assert.deepStrictEqual(result, left('error'))
 * })
 *
 * @category constructors
 * @since 2.0.0
 */
export function tryCatch(f, onRejected) {
    return function () { return f().then(E.right, function (reason) { return E.left(onRejected(reason)); }); };
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
flow(E.fold, T.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export var getOrElseW = function (onLeft) { return function (ma) {
    return pipe(ma, T.chain(E.fold(onLeft, T.of)));
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
 * Returns `ma` if is a `Right` or the value returned by `onLeft` otherwise.
 *
 * See also [alt](#alt).
 *
 * @example
 * import * as E from 'fp-ts/lib/Either'
 * import { pipe } from 'fp-ts/lib/function'
 * import * as TE from 'fp-ts/lib/TaskEither'
 *
 * async function test() {
 *   const errorHandler = TE.orElse((error: string) => TE.right(`recovering from ${error}...`))
 *   assert.deepStrictEqual(await pipe(TE.right('ok'), errorHandler)(), E.right('ok'))
 *   assert.deepStrictEqual(await pipe(TE.left('ko'), errorHandler)(), E.right('recovering from ko...'))
 * }
 *
 * test()
 *
 * @category combinators
 * @since 2.0.0
 */
export var orElse = function (f) { return T.chain(E.fold(f, right)); };
/**
 * @category combinators
 * @since 2.0.0
 */
export var swap = 
/*#__PURE__*/
T.map(E.swap);
/**
 * @category combinators
 * @since 2.0.0
 */
export var filterOrElse = function (predicate, onFalse) { return function (ma) {
    return pipe(ma, chain(function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); }));
}; };
/**
 * Converts a function returning a `Promise` to one returning a `TaskEither`.
 *
 * @category combinators
 * @since 2.5.0
 */
export function tryCatchK(f, onRejected) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return tryCatch(function () { return f.apply(void 0, a); }, onRejected);
    };
}
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
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return pipe(fa, map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return pipe(fa, bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return pipe(fa, mapLeft(f)); };
var apPar_ = function (fab, fa) { return pipe(fab, ap(fa)); };
var apSeq_ = function (fab, fa) { return chain_(fab, function (f) { return map_(fa, f); }); };
var chain_ = function (ma, f) { return pipe(ma, chain(f)); };
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
export var map = function (f) { return T.map(E.map(f)); };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var bimap = 
/*#__PURE__*/
flow(E.bimap, T.map);
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var mapLeft = function (f) {
    return T.map(E.mapLeft(f));
};
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = 
/*#__PURE__*/
apComposition(T.ApplicativePar, E.Applicative);
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
    return pipe(ma, T.chain(E.fold(left, f)));
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
export var flatten = 
/*#__PURE__*/
chain(identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * In case of `TaskEither` returns `fa` if is a `Right` or the value returned by `that` otherwise.
 *
 * See also [orElse](#orElse).
 *
 * @example
 * import * as E from 'fp-ts/lib/Either'
 * import { pipe } from 'fp-ts/lib/function'
 * import * as TE from 'fp-ts/lib/TaskEither'
 *
 * async function test() {
 *   assert.deepStrictEqual(
 *     await pipe(
 *       TE.right(1),
 *       TE.alt(() => TE.right(2))
 *     )(),
 *     E.right(1)
 *   )
 *   assert.deepStrictEqual(
 *     await pipe(
 *       TE.left('a'),
 *       TE.alt(() => TE.right(2))
 *     )(),
 *     E.right(2)
 *   )
 *   assert.deepStrictEqual(
 *     await pipe(
 *       TE.left('a'),
 *       TE.alt(() => TE.left('b'))
 *     )(),
 *     E.left('b')
 *   )
 * }
 *
 * test()
 *
 * @category Alt
 * @since 2.0.0
 */
export var alt = function (that) {
    return T.chain(E.fold(that, right));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
export var of = right;
/**
 * @category MonadIO
 * @since 2.7.0
 */
export var fromIO = rightIO;
/**
 * @category MonadTask
 * @since 2.7.0
 */
export var fromTask = rightTask;
/**
 * @category MonadTask
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
export var URI = 'TaskEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getSemigroup(S) {
    return T.getSemigroup(E.getSemigroup(S));
}
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getApplySemigroup(S) {
    return T.getSemigroup(E.getApplySemigroup(S));
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
export function getApplicativeTaskValidation(A, SE) {
    var ap = apComposition(A, E.getApplicativeValidation(SE));
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
export function getAltTaskValidation(SE) {
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) {
            return pipe(me, T.chain(function (e1) {
                return E.isRight(e1)
                    ? T.of(e1)
                    : pipe(that(), T.map(function (e2) { return (E.isLeft(e2) ? E.left(SE.concat(e1.left, e2.left)) : e2); }));
            }));
        }
    };
}
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export function getTaskValidation(SE) {
    var applicativeTaskValidation = getApplicativeTaskValidation(T.ApplicativePar, SE);
    var altTaskValidation = getAltTaskValidation(SE);
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        ap: applicativeTaskValidation.ap,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altTaskValidation.alt,
        fromIO: fromIO,
        fromTask: fromTask,
        throwError: throwError
    };
}
/**
 * @category instances
 * @since 2.1.0
 */
export function getFilterable(M) {
    var W = E.getWitherable(M);
    var F = getFilterableComposition(T.Monad, W);
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
export var taskEither = {
    URI: URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: apPar_,
    chain: chain_,
    alt: alt_,
    fromIO: fromIO,
    fromTask: fromTask,
    throwError: throwError
};
// TODO: remove in v3
/**
 * Like `TaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
export var taskEitherSeq = {
    URI: URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: apSeq_,
    chain: chain_,
    alt: alt_,
    fromIO: fromIO,
    fromTask: fromTask,
    throwError: throwError
};
export function taskify(f) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return function () {
            return new Promise(function (resolve) {
                var cbResolver = function (e, r) { return (e != null ? resolve(E.left(e)) : resolve(E.right(r))); };
                f.apply(null, args.concat(cbResolver));
            });
        };
    };
}
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
        return pipe(pipe(use(a), T.map(E.right)), chain(function (e) {
            return pipe(release(a, e), chain(function () { return (E.isLeft(e) ? left(e.left) : of(e.right)); }));
        }));
    }));
};
