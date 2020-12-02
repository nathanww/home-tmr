"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reader = exports.Choice = exports.Strong = exports.Category = exports.Profunctor = exports.Monad = exports.Applicative = exports.Functor = exports.getMonoid = exports.getSemigroup = exports.URI = exports.id = exports.promap = exports.compose = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.local = exports.asks = exports.ask = void 0;
var E = require("./Either");
var F = require("./function");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Reads the current context
 *
 * @category constructors
 * @since 2.0.0
 */
exports.ask = function () { return F.identity; };
/**
 * Projects a value from the global context in a Reader
 *
 * @category constructors
 * @since 2.0.0
 */
exports.asks = function (f) { return function (r) { return f(r); }; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Changes the value of the local context during the execution of the action `ma` (similar to `Contravariant`'s
 * `contramap`).
 *
 * @category combinators
 * @since 2.0.0
 */
exports.local = function (f) { return function (ma) { return function (q) { return ma(f(q)); }; }; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return F.pipe(fa, exports.map(f)); };
var ap_ = function (fab, fa) { return F.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return F.pipe(ma, exports.chain(f)); };
var compose_ = function (ab, la) { return function (l) { return ab(la(l)); }; };
var promap_ = function (mbc, f, g) { return function (a) {
    return g(mbc(f(a)));
}; };
var first_ = function (pab) { return function (_a) {
    var a = _a[0], c = _a[1];
    return [pab(a), c];
}; };
var second_ = function (pbc) { return function (_a) {
    var a = _a[0], b = _a[1];
    return [a, pbc(b)];
}; };
var left_ = function (pab) {
    return E.fold(function (a) { return E.left(pab(a)); }, E.right);
};
var right_ = function (pbc) {
    return E.fold(E.left, function (b) { return E.right(pbc(b)); });
};
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
exports.map = function (f) { return function (fa) { return function (r) { return f(fa(r)); }; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return function (r) {
    return fab(r)(fa(r));
}; }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) { return function (fa) {
    return F.pipe(fa, exports.map(function (a) { return function (_) { return a; }; }), exports.ap(fb));
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) { return function (fa) {
    return F.pipe(fa, exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
}; };
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function (a) { return function () { return a; }; };
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (fa) { return function (r) { return f(fa(r))(r); }; }; };
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
        return F.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(F.identity);
/**
 * @category Semigroupoid
 * @since 2.0.0
 */
exports.compose = function (la) { return function (ab) {
    return compose_(ab, la);
}; };
/**
 * @category Profunctor
 * @since 2.0.0
 */
exports.promap = function (f, g) { return function (fbc) { return promap_(fbc, f, g); }; };
/**
 * @category Category
 * @since 2.0.0
 */
exports.id = function () { return F.identity; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Reader';
/**
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return function (e) { return S.concat(x(e), y(e)); }; }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: function () { return M.empty; }
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
exports.Monad = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Profunctor = {
    URI: exports.URI,
    map: map_,
    promap: promap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Category = {
    URI: exports.URI,
    compose: compose_,
    id: exports.id
};
/**
 * @internal instances
 */
exports.Strong = {
    URI: exports.URI,
    map: map_,
    promap: promap_,
    first: first_,
    second: second_
};
/**
 * @internal instances
 */
exports.Choice = {
    URI: exports.URI,
    map: map_,
    promap: promap_,
    left: left_,
    right: right_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.reader = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    promap: promap_,
    compose: compose_,
    id: exports.id,
    first: first_,
    second: second_,
    left: left_,
    right: right_
};
