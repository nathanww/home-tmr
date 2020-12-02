"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readonlyTuple = exports.Traversable = exports.Foldable = exports.Comonad = exports.Semigroupoid = exports.Bifunctor = exports.Functor = exports.URI = exports.sequence = exports.traverse = exports.reduceRight = exports.reduce = exports.map = exports.foldMap = exports.extract = exports.extend = exports.duplicate = exports.compose = exports.mapLeft = exports.bimap = exports.getChainRec = exports.getMonad = exports.getChain = exports.getApplicative = exports.getApply = exports.swap = exports.snd = exports.fst = void 0;
var function_1 = require("./function");
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.5.0
 */
function fst(sa) {
    return sa[0];
}
exports.fst = fst;
/**
 * @category destructors
 * @since 2.5.0
 */
function snd(sa) {
    return sa[1];
}
exports.snd = snd;
/**
 * @category combinators
 * @since 2.5.0
 */
function swap(sa) {
    return [snd(sa), fst(sa)];
}
exports.swap = swap;
/**
 * @category instances
 * @since 2.5.0
 */
function getApply(S) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return [fst(fab)(fst(fa)), S.concat(snd(fab), snd(fa))]; }
    };
}
exports.getApply = getApply;
var of = function (M) { return function (a) {
    return [a, M.empty];
}; };
/**
 * @category instances
 * @since 2.5.0
 */
function getApplicative(M) {
    var A = getApply(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        of: of(M)
    };
}
exports.getApplicative = getApplicative;
/**
 * @category instances
 * @since 2.5.0
 */
function getChain(S) {
    var A = getApply(S);
    return {
        URI: exports.URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        chain: function (fa, f) {
            var _a = f(fst(fa)), b = _a[0], s = _a[1];
            return [b, S.concat(snd(fa), s)];
        }
    };
}
exports.getChain = getChain;
/**
 * @category instances
 * @since 2.5.0
 */
function getMonad(M) {
    var C = getChain(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: C.map,
        ap: C.ap,
        chain: C.chain,
        of: of(M)
    };
}
exports.getMonad = getMonad;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
function getChainRec(M) {
    var chainRec = function (a, f) {
        var result = f(a);
        var acc = M.empty;
        var s = fst(result);
        while (s._tag === 'Left') {
            acc = M.concat(acc, snd(result));
            result = f(s.left);
            s = fst(result);
        }
        return [s.right, M.concat(acc, snd(result))];
    };
    var C = getChain(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: C.map,
        ap: C.ap,
        chain: C.chain,
        chainRec: chainRec
    };
}
exports.getChainRec = getChainRec;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var compose_ = function (ba, ae) { return [fst(ba), snd(ae)]; };
var map_ = function (ae, f) { return [f(fst(ae)), snd(ae)]; };
var bimap_ = function (fea, f, g) { return [g(fst(fea)), f(snd(fea))]; };
var mapLeft_ = function (fea, f) { return [fst(fea), f(snd(fea))]; };
var extend_ = function (ae, f) { return [f(ae), snd(ae)]; };
var reduce_ = function (ae, b, f) { return f(b, fst(ae)); };
var foldMap_ = function (_) { return function (ae, f) { return f(fst(ae)); }; };
var reduceRight_ = function (ae, b, f) { return f(fst(ae), b); };
var traverse_ = function (F) { return function (as, f) {
    return F.map(f(fst(as)), function (b) { return [b, snd(as)]; });
}; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
exports.bimap = function (f, g) { return function (fa) { return bimap_(fa, f, g); }; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
exports.mapLeft = function (f) { return function (fa) {
    return mapLeft_(fa, f);
}; };
/**
 * @category Semigroupoid
 * @since 2.5.0
 */
exports.compose = function (la) { return function (ab) {
    return compose_(ab, la);
}; };
/**
 * @category Extend
 * @since 2.5.0
 */
exports.duplicate = function (ma) { return extend_(ma, function_1.identity); };
/**
 * @category Extend
 * @since 2.5.0
 */
exports.extend = function (f) { return function (ma) { return extend_(ma, f); }; };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = fst;
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.foldMap = function (M) {
    var foldMapM = foldMap_(M);
    return function (f) { return function (fa) { return foldMapM(fa, f); }; };
};
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduce = function (b, f) { return function (fa) {
    return reduce_(fa, b, f);
}; };
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    return reduceRight_(fa, b, f);
}; };
/**
 * @since 2.6.3
 */
exports.traverse = function (F) {
    return function (f) { return function (ta) { return traverse_(F)(ta, f); }; };
};
/**
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (fas) {
    return F.map(fst(fas), function (a) { return [a, snd(fas)]; });
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
exports.URI = 'ReadonlyTuple';
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
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Semigroupoid = {
    URI: exports.URI,
    compose: compose_
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
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
exports.readonlyTuple = {
    URI: exports.URI,
    compose: compose_,
    map: map_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    extract: exports.extract,
    extend: extend_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
