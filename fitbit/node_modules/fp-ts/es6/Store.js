import { identity } from './function';
/**
 * Reposition the focus at the specified position
 *
 * @since 2.0.0
 */
export function seek(s) {
    return function (wa) { return ({ peek: wa.peek, pos: s }); };
}
/**
 * Reposition the focus at the specified position, which depends on the current position
 *
 * @since 2.0.0
 */
export function seeks(f) {
    return function (wa) { return ({ peek: wa.peek, pos: f(wa.pos) }); };
}
/**
 * Extract a value from a position which depends on the current position
 *
 * @since 2.0.0
 */
export function peeks(f) {
    return function (wa) { return wa.peek(f(wa.pos)); };
}
export function experiment(F) {
    return function (f) { return function (wa) { return F.map(f(wa.pos), function (s) { return wa.peek(s); }); }; };
}
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (wa, f) { return ({
    peek: function (s) { return f(wa.peek(s)); },
    pos: wa.pos
}); };
var extend_ = function (wa, f) { return ({
    peek: function (s) { return f({ peek: wa.peek, pos: s }); },
    pos: wa.pos
}); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Extend
 * @since 2.0.0
 */
export var duplicate = function (wa) { return extend_(wa, identity); };
/**
 * @category Extract
 * @since 2.6.2
 */
export var extract = function (wa) { return wa.peek(wa.pos); };
/**
 * @category Extend
 * @since 2.0.0
 */
export var extend = function (f) { return function (wa) {
    return extend_(wa, f);
}; };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
export var map = function (f) { return function (fa) { return map_(fa, f); }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
export var URI = 'Store';
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
export var Comonad = {
    URI: URI,
    map: map_,
    extend: extend_,
    extract: extract
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export var store = Comonad;
