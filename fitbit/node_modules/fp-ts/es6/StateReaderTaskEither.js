import { identity, pipe } from './function';
import * as RTE from './ReaderTaskEither';
/* tslint:enable:readonly-array */
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
export function left(e) {
    return fromReaderTaskEither(RTE.left(e));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var right = function (a) { return function (s) {
    return RTE.right([a, s]);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
export function rightTask(ma) {
    return fromReaderTaskEither(RTE.rightTask(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftTask(me) {
    return fromReaderTaskEither(RTE.leftTask(me));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function fromTaskEither(ma) {
    return fromReaderTaskEither(RTE.fromTaskEither(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function rightReader(ma) {
    return fromReaderTaskEither(RTE.rightReader(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftReader(me) {
    return fromReaderTaskEither(RTE.leftReader(me));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function fromIOEither(ma) {
    return fromReaderTaskEither(RTE.fromIOEither(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function fromReaderEither(ma) {
    return fromReaderTaskEither(RTE.fromReaderEither(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function rightIO(ma) {
    return fromReaderTaskEither(RTE.rightIO(ma));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftIO(me) {
    return fromReaderTaskEither(RTE.leftIO(me));
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var rightState = function (sa) { return function (s) { return RTE.right(sa(s)); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
export function leftState(me) {
    return function (s) { return RTE.left(me(s)[0]); };
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromReaderTaskEither = function (fa) { return function (s) {
    return pipe(fa, RTE.map(function (a) { return [a, s]; }));
}; };
/**
 * Get the current state
 *
 * @category constructors
 * @since 2.0.0
 */
export var get = function () { return function (s) { return RTE.right([s, s]); }; };
/**
 * Set the state
 *
 * @category constructors
 * @since 2.0.0
 */
export var put = function (s) { return function () {
    return RTE.right([undefined, s]);
}; };
/**
 * Modify the state by applying a function to the current state
 *
 * @category constructors
 * @since 2.0.0
 */
export var modify = function (f) { return function (s) {
    return RTE.right([undefined, f(s)]);
}; };
/**
 * Get a value which depends on the current state
 *
 * @category constructors
 * @since 2.0.0
 */
export var gets = function (f) { return function (s) {
    return RTE.right([f(s), s]);
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
 * @since 2.4.4
 */
export var fromPredicate = function (predicate, onFalse) { return function (a) {
    return predicate(a) ? right(a) : left(onFalse(a));
}; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
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
export var chainEitherKW = function (f) { return function (ma) { return pipe(ma, chainW(fromEitherK(f))); }; };
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
export var chainIOEitherKW = function (f) { return function (ma) { return pipe(ma, chainW(fromIOEitherK(f))); }; };
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
export var chainTaskEitherKW = function (f) { return function (ma) { return pipe(ma, chainW(fromTaskEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainTaskEitherK = chainTaskEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
export function fromReaderTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromReaderTaskEither(f.apply(void 0, a));
    };
}
/**
 * Less strict version of [`chainReaderTaskEitherK`](#chainReaderTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export var chainReaderTaskEitherKW = function (f) { return function (ma) { return pipe(ma, chainW(fromReaderTaskEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
export var chainReaderTaskEitherK = chainReaderTaskEitherKW;
/**
 * @category combinators
 * @since 2.4.4
 */
export var filterOrElse = function (predicate, onFalse) { return function (ma) {
    return pipe(ma, chain(function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); }));
}; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return pipe(fa, map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return pipe(fab, ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return pipe(ma, chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function (s) {
    return pipe(fa(s), RTE.alt(function () { return that()(s); }));
}; };
var bimap_ = function (fea, f, g) { return function (s) {
    return pipe(fea(s), RTE.bimap(f, function (_a) {
        var a = _a[0], s = _a[1];
        return [g(a), s];
    }));
}; };
var mapLeft_ = function (fea, f) { return function (s) { return pipe(fea(s), RTE.mapLeft(f)); }; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
export var map = function (f) { return function (fa) { return function (s1) {
    return pipe(fa(s1), RTE.map(function (_a) {
        var a = _a[0], s2 = _a[1];
        return [f(a), s2];
    }));
}; }; };
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
export var bimap = function (f, g) { return function (fa) {
    return bimap_(fa, f, g);
}; };
/**
 * Map a function over the third type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
export var mapLeft = function (f) { return function (fa) {
    return mapLeft_(fa, f);
}; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = function (fa) { return function (fab) { return function (s1) {
    return pipe(fab(s1), RTE.chain(function (_a) {
        var f = _a[0], s2 = _a[1];
        return pipe(fa(s2), RTE.map(function (_a) {
            var a = _a[0], s3 = _a[1];
            return [f(a), s3];
        }));
    }));
}; }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apFirst = function (fb) { return function (fa) {
    return pipe(fa, map(function (a) { return function (_) { return a; }; }), ap(fb));
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
export var chainW = function (f) { return function (ma) { return function (s1) {
    return pipe(ma(s1), RTE.chainW(function (_a) {
        var a = _a[0], s2 = _a[1];
        return f(a)(s2);
    }));
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
 * @since 2.6.2
 */
export var alt = function (that) { return function (fa) { return function (s) {
    return pipe(fa(s), RTE.alt(function () { return that()(s); }));
}; }; };
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
export var URI = 'StateReaderTaskEither';
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
export var stateReaderTaskEither = {
    URI: URI,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    fromIO: fromIO,
    fromTask: fromTask,
    throwError: throwError
};
// TODO: remove in v3
/**
 * Like `stateReaderTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
export var stateReaderTaskEitherSeq = {
    URI: URI,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    fromIO: fromIO,
    fromTask: fromTask,
    throwError: throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/* tslint:disable:readonly-array */
/**
 * @since 2.0.0
 */
/* istanbul ignore next */
export function run(ma, s, r) {
    return ma(s)(r)();
}
/* tslint:enable:readonly-array */
// TODO: curry and rename to `evaluate` in v3
/**
 * Run a computation in the `StateReaderTaskEither` monad, discarding the final state
 *
 * @since 2.0.0
 */
export var evalState = function (fsa, s) {
    return pipe(fsa(s), RTE.map(function (_a) {
        var a = _a[0];
        return a;
    }));
};
// TODO: curry and rename to `execute` in v3
/**
 * Run a computation in the `StateReaderTaskEither` monad discarding the result
 *
 * @since 2.0.0
 */
export var execState = function (fsa, s) {
    return pipe(fsa(s), RTE.map(function (_a) {
        var _ = _a[0], s = _a[1];
        return s;
    }));
};
