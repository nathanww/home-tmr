import { identity } from './function';
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.5.0
 */
export function fst(sa) {
    return sa[0];
}
/**
 * @category destructors
 * @since 2.5.0
 */
export function snd(sa) {
    return sa[1];
}
/**
 * @category combinators
 * @since 2.5.0
 */
export function swap(sa) {
    return [snd(sa), fst(sa)];
}
/**
 * @category instances
 * @since 2.5.0
 */
export function getApply(S) {
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return [fst(fab)(fst(fa)), S.concat(snd(fab), snd(fa))]; }
    };
}
var of = function (M) { return function (a) {
    return [a, M.empty];
}; };
/**
 * @category instances
 * @since 2.5.0
 */
export function getApplicative(M) {
    var A = getApply(M);
    return {
        URI: URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        of: of(M)
    };
}
/**
 * @category instances
 * @since 2.5.0
 */
export function getChain(S) {
    var A = getApply(S);
    return {
        URI: URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        chain: function (fa, f) {
            var _a = f(fst(fa)), b = _a[0], s = _a[1];
            return [b, S.concat(snd(fa), s)];
        }
    };
}
/**
 * @category instances
 * @since 2.5.0
 */
export function getMonad(M) {
    var C = getChain(M);
    return {
        URI: URI,
        _E: undefined,
        map: C.map,
        ap: C.ap,
        chain: C.chain,
        of: of(M)
    };
}
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
export function getChainRec(M) {
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
        URI: URI,
        _E: undefined,
        map: C.map,
        ap: C.ap,
        chain: C.chain,
        chainRec: chainRec
    };
}
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
export var bimap = function (f, g) { return function (fa) { return bimap_(fa, f, g); }; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
export var mapLeft = function (f) { return function (fa) {
    return mapLeft_(fa, f);
}; };
/**
 * @category Semigroupoid
 * @since 2.5.0
 */
export var compose = function (la) { return function (ab) {
    return compose_(ab, la);
}; };
/**
 * @category Extend
 * @since 2.5.0
 */
export var duplicate = function (ma) { return extend_(ma, identity); };
/**
 * @category Extend
 * @since 2.5.0
 */
export var extend = function (f) { return function (ma) { return extend_(ma, f); }; };
/**
 * @category Extract
 * @since 2.6.2
 */
export var extract = fst;
/**
 * @category Foldable
 * @since 2.5.0
 */
export var foldMap = function (M) {
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
export var map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * @category Foldable
 * @since 2.5.0
 */
export var reduce = function (b, f) { return function (fa) {
    return reduce_(fa, b, f);
}; };
/**
 * @category Foldable
 * @since 2.5.0
 */
export var reduceRight = function (b, f) { return function (fa) {
    return reduceRight_(fa, b, f);
}; };
/**
 * @since 2.6.3
 */
export var traverse = function (F) {
    return function (f) { return function (ta) { return traverse_(F)(ta, f); }; };
};
/**
 * @since 2.6.3
 */
export var sequence = function (F) { return function (fas) {
    return F.map(fst(fas), function (a) { return [a, snd(fas)]; });
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
export var URI = 'ReadonlyTuple';
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
export var Bifunctor = {
    URI: URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Semigroupoid = {
    URI: URI,
    compose: compose_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Comonad = {
    URI: URI,
    map: map_,
    extend: extend_,
    extract: extract
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Foldable = {
    URI: URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Traversable = {
    URI: URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
export var readonlyTuple = {
    URI: URI,
    compose: compose_,
    map: map_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    extract: extract,
    extend: extend_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence
};
