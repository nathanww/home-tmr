import { identity } from './function';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromIO = function (ma) { return function () { return Promise.resolve(ma()); }; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Creates a task that will complete after a time delay
 *
 * @example
 * import { sequenceT } from 'fp-ts/lib/Apply'
 * import * as T from 'fp-ts/lib/Task'
 *
 * async function test() {
 *   const log: Array<string> = []
 *   const append = (message: string): T.Task<void> =>
 *     T.fromIO(() => {
 *       log.push(message)
 *     })
 *   const fa = append('a')
 *   const fb = append('b')
 *   const fc = T.delay(10)(append('c'))
 *   const fd = append('d')
 *   await sequenceT(T.task)(fa, fb, fc, fd)()
 *   assert.deepStrictEqual(log, ['a', 'b', 'd', 'c'])
 * }
 *
 * test()
 *
 * @category combinators
 * @since 2.0.0
 */
export function delay(millis) {
    return function (ma) { return function () {
        return new Promise(function (resolve) {
            setTimeout(function () {
                // tslint:disable-next-line: no-floating-promises
                ma().then(resolve);
            }, millis);
        });
    }; };
}
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
export function chainIOK(f) {
    return chain(fromIOK(f));
}
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (ma, f) { return function () { return ma().then(f); }; };
var apPar_ = function (mab, ma) { return function () { return Promise.all([mab(), ma()]).then(function (_a) {
    var f = _a[0], a = _a[1];
    return f(a);
}); }; };
var apSeq_ = function (fab, fa) { return chain_(fab, function (f) { return map_(fa, f); }); };
var chain_ = function (ma, f) { return function () { return ma().then(function (a) { return f(a)(); }); }; };
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
export var map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = function (fa) { return function (fab) { return apPar_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apFirst = function (fb) { return function (fa) {
    return apPar_(map_(fa, function (a) { return function () { return a; }; }), fb);
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apSecond = function (fb) { return function (fa) {
    return apPar_(map_(fa, function () { return function (b) { return b; }; }), fb);
}; };
/**
 * @category Applicative
 * @since 2.0.0
 */
export var of = function (a) { return function () { return Promise.resolve(a); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export var chain = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export var chainFirst = function (f) { return function (ma) {
    return chain_(ma, function (a) { return map_(f(a), function () { return a; }); });
}; };
/**
 * @category Monad
 * @since 2.0.0
 */
export var flatten = function (mma) { return chain_(mma, identity); };
/**
 * @category MonadTask
 * @since 2.7.0
 */
export var fromTask = identity;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
export var URI = 'Task';
/**
 * Lift a semigroup into 'Task', the inner values are concatenated using the provided `Semigroup`.
 *
 * @example
 * import * as T from 'fp-ts/lib/Task'
 * import { semigroupString } from 'fp-ts/lib/Semigroup'
 *
 * async function test() {
 *   const S = T.getSemigroup(semigroupString)
 *   const fa = T.of('a')
 *   const fb = T.of('b')
 *   assert.deepStrictEqual(await S.concat(fa, fb)(), 'ab')
 * }
 *
 * test()
 *
 * @category instances
 * @since 2.0.0
 */
export function getSemigroup(S) {
    return {
        concat: function (x, y) { return function () { return x().then(function (rx) { return y().then(function (ry) { return S.concat(rx, ry); }); }); }; }
    };
}
/**
 * Lift a monoid into 'Task', the inner values are concatenated using the provided `Monoid`.
 *
 * @category instances
 * @since 2.0.0
 */
export function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: of(M.empty)
    };
}
/**
 * Monoid returning the first completed task.
 *
 * Note: uses `Promise.race` internally.
 *
 * @example
 * import * as T from 'fp-ts/lib/Task'
 *
 * async function test() {
 *   const S = T.getRaceMonoid<string>()
 *   const fa = T.delay(20)(T.of('a'))
 *   const fb = T.delay(10)(T.of('b'))
 *   assert.deepStrictEqual(await S.concat(fa, fb)(), 'b')
 * }
 *
 * test()
 *
 * @category instances
 * @since 2.0.0
 */
export function getRaceMonoid() {
    return {
        concat: function (x, y) { return function () { return Promise.race([x(), y()]); }; },
        empty: never
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
 * Used in TaskEither.getTaskValidation
 *
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
 * @since 2.0.0
 */
export var task = {
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
 * Like `task` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
export var taskSeq = {
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
/**
 * A `Task` that never completes.
 *
 * @since 2.0.0
 */
export var never = function () { return new Promise(function (_) { return undefined; }); };
