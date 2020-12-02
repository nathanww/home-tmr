"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bracket = exports.run = exports.readerTaskEitherSeq = exports.readerTaskEither = exports.Alt = exports.Bifunctor = exports.ApplicativeSeq = exports.ApplicativePar = exports.Functor = exports.getReaderTaskValidation = exports.getAltReaderTaskValidation = exports.getApplicativeReaderTaskValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.fromTask = exports.fromIO = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.mapLeft = exports.bimap = exports.map = exports.chainTaskEitherK = exports.chainTaskEitherKW = exports.fromTaskEitherK = exports.chainIOEitherK = exports.chainIOEitherKW = exports.fromIOEitherK = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.filterOrElse = exports.local = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.asks = exports.ask = exports.leftIO = exports.rightIO = exports.fromReaderEither = exports.fromIOEither = exports.leftReader = exports.rightReaderTask = exports.leftReaderTask = exports.rightReader = exports.fromTaskEither = exports.leftTask = exports.rightTask = exports.right = exports.left = void 0;
var Apply_1 = require("./Apply");
var function_1 = require("./function");
var R = require("./Reader");
var T = require("./Task");
var TE = require("./TaskEither");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
function left(e) {
    return exports.fromTaskEither(TE.left(e));
}
exports.left = left;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = function (a) { return function () { return TE.right(a); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
function rightTask(ma) {
    return exports.fromTaskEither(TE.rightTask(ma));
}
exports.rightTask = rightTask;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftTask(me) {
    return exports.fromTaskEither(TE.leftTask(me));
}
exports.leftTask = leftTask;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromTaskEither = 
/*#__PURE__*/
R.of;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightReader = function (ma) { return function (r) {
    return TE.right(ma(r));
}; };
/**
 * @category constructors
 * @since 2.5.0
 */
function leftReaderTask(me) {
    return function (r) { return TE.leftTask(me(r)); };
}
exports.leftReaderTask = leftReaderTask;
/**
 * @category constructors
 * @since 2.5.0
 */
function rightReaderTask(ma) {
    return function (r) { return TE.rightTask(ma(r)); };
}
exports.rightReaderTask = rightReaderTask;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftReader(me) {
    return function (r) { return TE.left(me(r)); };
}
exports.leftReader = leftReader;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromIOEither(ma) {
    return exports.fromTaskEither(TE.fromIOEither(ma));
}
exports.fromIOEither = fromIOEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromReaderEither(ma) {
    return function (r) { return TE.fromEither(ma(r)); };
}
exports.fromReaderEither = fromReaderEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function rightIO(ma) {
    return exports.fromTaskEither(TE.rightIO(ma));
}
exports.rightIO = rightIO;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftIO(me) {
    return exports.fromTaskEither(TE.leftIO(me));
}
exports.leftIO = leftIO;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.ask = function () { return TE.right; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.asks = function (f) { return function (r) {
    return function_1.pipe(TE.right(r), TE.map(f));
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = function (ma) {
    return ma._tag === 'Left' ? left(ma.left) : exports.right(ma.right);
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) { return (ma._tag === 'None' ? left(onNone()) : exports.right(ma.value)); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
function fold(onLeft, onRight) {
    return function (ma) { return function (r) {
        return function_1.pipe(ma(r), TE.fold(function (e) { return onLeft(e)(r); }, function (a) { return onRight(a)(r); }));
    }; };
}
exports.fold = fold;
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) { return function (r) {
    return TE.getOrElseW(function (e) { return onLeft(e)(r); })(ma(r));
}; }; };
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
function orElse(onLeft) {
    return function (ma) { return function (r) { return TE.orElse(function (e) { return onLeft(e)(r); })(ma(r)); }; };
}
exports.orElse = orElse;
/**
 * @category combinators
 * @since 2.0.0
 */
function swap(ma) {
    return function (e) { return TE.swap(ma(e)); };
}
exports.swap = swap;
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.0.0
 */
exports.local = R.local;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) { return function (ma) {
    return function_1.pipe(ma, exports.chain(function (a) { return (predicate(a) ? exports.right(a) : left(onFalse(a))); }));
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
 * @category combinators
 * @since 2.4.0
 */
function fromIOEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromIOEither(f.apply(void 0, a));
    };
}
exports.fromIOEitherK = fromIOEitherK;
/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainIOEitherKW = function (f) { return exports.chainW(fromIOEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainIOEitherK = exports.chainIOEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromTaskEither(f.apply(void 0, a));
    };
}
exports.fromTaskEitherK = fromTaskEitherK;
/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainTaskEitherKW = function (f) { return exports.chainW(fromTaskEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainTaskEitherK = exports.chainTaskEitherKW;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var apPar_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var apSeq_ = function (fab, fa) { return chain_(fab, function (f) { return map_(fa, f); }); };
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
var alt_ = function (fa, that) { return function (r) {
    return function_1.pipe(fa(r), TE.alt(function () { return that()(r); }));
}; };
var bimap_ = function (ma, f, g) { return function (e) { return function_1.pipe(ma(e), TE.bimap(f, g)); }; };
var mapLeft_ = function (ma, f) { return function (e) { return function_1.pipe(ma(e), TE.mapLeft(f)); }; };
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
exports.map = function (f) { return function (fa) { return function_1.flow(fa, TE.map(f)); }; };
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = function (f, g) { return function (fa) { return bimap_(fa, f, g); }; };
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return function (fa) { return mapLeft_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return function (r) {
    return function_1.pipe(fab(r), TE.ap(fa(r)));
}; }; };
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
 * @category Applicative
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (fa) { return function (r) {
    return function_1.pipe(fa(r), TE.chainW(function (a) { return f(a)(r); }));
}; }; };
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
exports.alt = function (that) { return function (fa) { return alt_(fa, that); }; };
/**
 * @category MonadIO
 * @since 2.0.0
 */
exports.fromIO = rightIO;
/**
 * @category MonadTask
 * @since 2.0.0
 */
exports.fromTask = rightTask;
/**
 * @category MonadThrow
 * @since 2.0.0
 */
exports.throwError = left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'ReaderTaskEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return R.getSemigroup(TE.getSemigroup(S));
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
    return R.getSemigroup(TE.getApplySemigroup(S));
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
function getApplicativeReaderTaskValidation(A, SE) {
    var ap = Apply_1.apComposition(R.Applicative, TE.getApplicativeTaskValidation(A, SE));
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: exports.of
    };
}
exports.getApplicativeReaderTaskValidation = getApplicativeReaderTaskValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltReaderTaskValidation(SE) {
    var A = TE.getAltTaskValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function (r) { return A.alt(me(r), function () { return that()(r); }); }; }
    };
}
exports.getAltReaderTaskValidation = getAltReaderTaskValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
function getReaderTaskValidation(SE) {
    var applicativeReaderTaskValidation = getApplicativeReaderTaskValidation(T.ApplicativePar, SE);
    var altReaderTaskValidation = getAltReaderTaskValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        of: exports.of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        ap: applicativeReaderTaskValidation.ap,
        alt: altReaderTaskValidation.alt,
        fromIO: exports.fromIO,
        fromTask: exports.fromTask,
        throwError: exports.throwError
    };
}
exports.getReaderTaskValidation = getReaderTaskValidation;
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
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.readerTaskEither = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_,
    alt: alt_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * Like `readerTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
exports.readerTaskEitherSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apSeq_,
    chain: chain_,
    alt: alt_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @since 2.0.0
 */
/* istanbul ignore next */
function run(ma, r) {
    return ma(r)();
}
exports.run = run;
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.4
 */
function bracket(aquire, use, release) {
    return function (r) {
        return TE.bracket(aquire(r), function (a) { return use(a)(r); }, function (a, e) { return release(a, e)(r); });
    };
}
exports.bracket = bracket;
