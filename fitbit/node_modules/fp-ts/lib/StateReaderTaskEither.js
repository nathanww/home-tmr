"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execState = exports.evalState = exports.run = exports.stateReaderTaskEitherSeq = exports.stateReaderTaskEither = exports.Alt = exports.Bifunctor = exports.Applicative = exports.Functor = exports.URI = exports.throwError = exports.fromTask = exports.fromIO = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.mapLeft = exports.bimap = exports.map = exports.filterOrElse = exports.chainReaderTaskEitherK = exports.chainReaderTaskEitherKW = exports.fromReaderTaskEitherK = exports.chainTaskEitherK = exports.chainTaskEitherKW = exports.fromTaskEitherK = exports.chainIOEitherK = exports.chainIOEitherKW = exports.fromIOEitherK = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.gets = exports.modify = exports.put = exports.get = exports.fromReaderTaskEither = exports.leftState = exports.rightState = exports.leftIO = exports.rightIO = exports.fromReaderEither = exports.fromIOEither = exports.leftReader = exports.rightReader = exports.fromTaskEither = exports.leftTask = exports.rightTask = exports.right = exports.left = void 0;
var function_1 = require("./function");
var RTE = require("./ReaderTaskEither");
/* tslint:enable:readonly-array */
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
function left(e) {
    return exports.fromReaderTaskEither(RTE.left(e));
}
exports.left = left;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = function (a) { return function (s) {
    return RTE.right([a, s]);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
function rightTask(ma) {
    return exports.fromReaderTaskEither(RTE.rightTask(ma));
}
exports.rightTask = rightTask;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftTask(me) {
    return exports.fromReaderTaskEither(RTE.leftTask(me));
}
exports.leftTask = leftTask;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromTaskEither(ma) {
    return exports.fromReaderTaskEither(RTE.fromTaskEither(ma));
}
exports.fromTaskEither = fromTaskEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function rightReader(ma) {
    return exports.fromReaderTaskEither(RTE.rightReader(ma));
}
exports.rightReader = rightReader;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftReader(me) {
    return exports.fromReaderTaskEither(RTE.leftReader(me));
}
exports.leftReader = leftReader;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromIOEither(ma) {
    return exports.fromReaderTaskEither(RTE.fromIOEither(ma));
}
exports.fromIOEither = fromIOEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromReaderEither(ma) {
    return exports.fromReaderTaskEither(RTE.fromReaderEither(ma));
}
exports.fromReaderEither = fromReaderEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function rightIO(ma) {
    return exports.fromReaderTaskEither(RTE.rightIO(ma));
}
exports.rightIO = rightIO;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftIO(me) {
    return exports.fromReaderTaskEither(RTE.leftIO(me));
}
exports.leftIO = leftIO;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightState = function (sa) { return function (s) { return RTE.right(sa(s)); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
function leftState(me) {
    return function (s) { return RTE.left(me(s)[0]); };
}
exports.leftState = leftState;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromReaderTaskEither = function (fa) { return function (s) {
    return function_1.pipe(fa, RTE.map(function (a) { return [a, s]; }));
}; };
/**
 * Get the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.get = function () { return function (s) { return RTE.right([s, s]); }; };
/**
 * Set the state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.put = function (s) { return function () {
    return RTE.right([undefined, s]);
}; };
/**
 * Modify the state by applying a function to the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.modify = function (f) { return function (s) {
    return RTE.right([undefined, f(s)]);
}; };
/**
 * Get a value which depends on the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.gets = function (f) { return function (s) {
    return RTE.right([f(s), s]);
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
 * @since 2.4.4
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) {
    return predicate(a) ? exports.right(a) : left(onFalse(a));
}; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
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
exports.chainEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromEitherK(f))); }; };
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
exports.chainIOEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromIOEitherK(f))); }; };
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
        return fromTaskEither(f.apply(void 0, a));
    };
}
exports.fromTaskEitherK = fromTaskEitherK;
/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainTaskEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromTaskEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainTaskEitherK = exports.chainTaskEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromReaderTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromReaderTaskEither(f.apply(void 0, a));
    };
}
exports.fromReaderTaskEitherK = fromReaderTaskEitherK;
/**
 * Less strict version of [`chainReaderTaskEitherK`](#chainReaderTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainReaderTaskEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromReaderTaskEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainReaderTaskEitherK = exports.chainReaderTaskEitherKW;
/**
 * @category combinators
 * @since 2.4.4
 */
exports.filterOrElse = function (predicate, onFalse) { return function (ma) {
    return function_1.pipe(ma, exports.chain(function (a) { return (predicate(a) ? exports.right(a) : left(onFalse(a))); }));
}; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function (s) {
    return function_1.pipe(fa(s), RTE.alt(function () { return that()(s); }));
}; };
var bimap_ = function (fea, f, g) { return function (s) {
    return function_1.pipe(fea(s), RTE.bimap(f, function (_a) {
        var a = _a[0], s = _a[1];
        return [g(a), s];
    }));
}; };
var mapLeft_ = function (fea, f) { return function (s) { return function_1.pipe(fea(s), RTE.mapLeft(f)); }; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function (s1) {
    return function_1.pipe(fa(s1), RTE.map(function (_a) {
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
exports.bimap = function (f, g) { return function (fa) {
    return bimap_(fa, f, g);
}; };
/**
 * Map a function over the third type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.mapLeft = function (f) { return function (fa) {
    return mapLeft_(fa, f);
}; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return function (s1) {
    return function_1.pipe(fab(s1), RTE.chain(function (_a) {
        var f = _a[0], s2 = _a[1];
        return function_1.pipe(fa(s2), RTE.map(function (_a) {
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
exports.apFirst = function (fb) { return function (fa) {
    return function_1.pipe(fa, exports.map(function (a) { return function (_) { return a; }; }), exports.ap(fb));
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
exports.chainW = function (f) { return function (ma) { return function (s1) {
    return function_1.pipe(ma(s1), RTE.chainW(function (_a) {
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
 * @since 2.6.2
 */
exports.alt = function (that) { return function (fa) { return function (s) {
    return function_1.pipe(fa(s), RTE.alt(function () { return that()(s); }));
}; }; };
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = rightIO;
/**
 * @category MonadTask
 * @since 2.7.0
 */
exports.fromTask = rightTask;
/**
 * @category MonadThrow
 * @since 2.7.0
 */
exports.throwError = left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'StateReaderTaskEither';
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
exports.stateReaderTaskEither = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * Like `stateReaderTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
exports.stateReaderTaskEitherSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
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
function run(ma, s, r) {
    return ma(s)(r)();
}
exports.run = run;
/* tslint:enable:readonly-array */
// TODO: curry and rename to `evaluate` in v3
/**
 * Run a computation in the `StateReaderTaskEither` monad, discarding the final state
 *
 * @since 2.0.0
 */
exports.evalState = function (fsa, s) {
    return function_1.pipe(fsa(s), RTE.map(function (_a) {
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
exports.execState = function (fsa, s) {
    return function_1.pipe(fsa(s), RTE.map(function (_a) {
        var _ = _a[0], s = _a[1];
        return s;
    }));
};
