"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.Comonad = exports.Functor = exports.URI = exports.map = exports.extend = exports.extract = exports.duplicate = exports.experiment = exports.peeks = exports.seeks = exports.seek = void 0;
var function_1 = require("./function");
/**
 * Reposition the focus at the specified position
 *
 * @since 2.0.0
 */
function seek(s) {
    return function (wa) { return ({ peek: wa.peek, pos: s }); };
}
exports.seek = seek;
/**
 * Reposition the focus at the specified position, which depends on the current position
 *
 * @since 2.0.0
 */
function seeks(f) {
    return function (wa) { return ({ peek: wa.peek, pos: f(wa.pos) }); };
}
exports.seeks = seeks;
/**
 * Extract a value from a position which depends on the current position
 *
 * @since 2.0.0
 */
function peeks(f) {
    return function (wa) { return wa.peek(f(wa.pos)); };
}
exports.peeks = peeks;
function experiment(F) {
    return function (f) { return function (wa) { return F.map(f(wa.pos), function (s) { return wa.peek(s); }); }; };
}
exports.experiment = experiment;
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
exports.duplicate = function (wa) { return extend_(wa, function_1.identity); };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = function (wa) { return wa.peek(wa.pos); };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (wa) {
    return extend_(wa, f);
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
exports.URI = 'Store';
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
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.store = exports.Comonad;
