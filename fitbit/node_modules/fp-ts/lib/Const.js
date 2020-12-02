"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.const_ = exports.Bifunctor = exports.Contravariant = exports.Functor = exports.URI = exports.mapLeft = exports.bimap = exports.map = exports.contramap = exports.getApplicative = exports.getApply = exports.getBooleanAlgebra = exports.getHeytingAlgebra = exports.getRing = exports.getSemiring = exports.getMonoid = exports.getSemigroup = exports.getBounded = exports.getOrd = exports.getEq = exports.getShow = exports.make = void 0;
var function_1 = require("./function");
/**
 * @category constructors
 * @since 2.0.0
 */
exports.make = function_1.unsafeCoerce;
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(S) {
    return {
        show: function (c) { return "make(" + S.show(c) + ")"; }
    };
}
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getEq = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getOrd = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getBounded = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getSemigroup = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getMonoid = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getSemiring = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getRing = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getHeytingAlgebra = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getBooleanAlgebra = function_1.identity;
/**
 * @category instances
 * @since 2.0.0
 */
function getApply(S) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return exports.make(S.concat(fab, fa)); }
    };
}
exports.getApply = getApply;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplicative(M) {
    var A = getApply(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        of: function () { return exports.make(M.empty); }
    };
}
exports.getApplicative = getApplicative;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var contramap_ = function_1.unsafeCoerce;
var map_ = function_1.unsafeCoerce;
var bimap_ = function (fea, f) { return exports.make(f(fea)); };
var mapLeft_ = function (fea, f) { return exports.make(f(fea)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Contravariant
 * @since 2.0.0
 */
exports.contramap = function (f) { return function (fa) { return contramap_(fa, f); }; };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.bimap = function (f, g) { return function (fa) {
    return bimap_(fa, f, g);
}; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.mapLeft = function (f) { return function (fa) { return mapLeft_(fa, f); }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Const';
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
exports.Contravariant = {
    URI: exports.URI,
    contramap: contramap_
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
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.const_ = {
    URI: exports.URI,
    map: map_,
    contramap: contramap_,
    bimap: bimap_,
    mapLeft: mapLeft_
};
