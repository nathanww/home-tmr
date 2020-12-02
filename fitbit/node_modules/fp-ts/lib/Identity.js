"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identity = exports.ChainRec = exports.Comonad = exports.Alt = exports.Traversable = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.getEq = exports.getShow = exports.URI = exports.map = exports.reduceRight = exports.reduce = exports.foldMap = exports.flatten = exports.extend = exports.extract = exports.duplicate = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.alt = exports.sequence = exports.traverse = void 0;
var ChainRec_1 = require("./ChainRec");
var function_1 = require("./function");
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (ma, f) { return f(ma); };
var ap_ = function (mab, ma) { return mab(ma); };
var chain_ = function (ma, f) { return f(ma); };
var reduce_ = function (fa, b, f) { return f(b, fa); };
var foldMap_ = function (_) { return function (fa, f) { return f(fa); }; };
var reduceRight_ = function (fa, b, f) { return f(fa, b); };
var alt_ = function_1.identity;
var extend_ = function (wa, f) { return f(wa); };
var traverse_ = function (F) { return function (ta, f) {
    return F.map(f(ta), function_1.identity);
}; };
var chainRec_ = ChainRec_1.tailRec;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @since 2.6.3
 */
exports.traverse = function (F) {
    var traverseF = traverse_(F);
    return function (f) { return function (ta) { return traverseF(ta, f); }; };
};
/**
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ta) {
    return F.map(ta, function_1.identity);
}; };
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return function (fa) { return alt_(fa, that); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) { return function (fa) {
    return ap_(map_(fa, function (a) { return function () { return a; }; }), fb);
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) { return function (fa) {
    return ap_(map_(fa, function () { return function (b) { return b; }; }), fb);
}; };
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function_1.identity;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) { return function (ma) {
    return chain_(ma, function (a) { return map_(f(a), function () { return a; }); });
}; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = function (wa) { return extend_(wa, function_1.identity); };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = function_1.identity;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (ma) {
    return extend_(ma, f);
}; };
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = function (mma) { return chain_(mma, function_1.identity); };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = function (M) {
    var foldMapM = foldMap_(M);
    return function (f) { return function (fa) { return foldMapM(fa, f); }; };
};
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) { return reduce_(fa, b, f); }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    return reduceRight_(fa, b, f);
}; };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Identity';
/**
 * @category instances
 * @since 2.0.0
 */
exports.getShow = function_1.identity;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getEq = function_1.identity;
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
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
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
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ChainRec = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    chain: chain_,
    chainRec: chainRec_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.identity = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    alt: alt_,
    extract: exports.extract,
    extend: extend_,
    chainRec: chainRec_
};
