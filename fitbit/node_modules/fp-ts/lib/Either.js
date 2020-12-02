"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exports.elem = exports.toError = exports.either = exports.getValidationMonoid = exports.MonadThrow = exports.ChainRec = exports.Extend = exports.Alt = exports.Bifunctor = exports.Traversable = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.getValidationSemigroup = exports.getValidation = exports.getAltValidation = exports.getApplicativeValidation = exports.getWitherable = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.getEq = exports.getShow = exports.URI = exports.throwError = exports.sequence = exports.traverse = exports.reduceRight = exports.foldMap = exports.reduce = exports.extend = exports.duplicate = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.mapLeft = exports.bimap = exports.map = exports.filterOrElse = exports.orElse = exports.swap = exports.getOrElse = exports.getOrElseW = exports.fold = exports.fromPredicate = exports.fromOption = exports.stringifyJSON = exports.parseJSON = exports.tryCatch = exports.fromNullable = exports.right = exports.left = exports.isRight = exports.isLeft = void 0;
var ChainRec_1 = require("./ChainRec");
var function_1 = require("./function");
// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
exports.isLeft = function (ma) { return ma._tag === 'Left'; };
/**
 * Returns `true` if the either is an instance of `Right`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
exports.isRight = function (ma) { return ma._tag === 'Right'; };
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
 * structure
 *
 * @category constructors
 * @since 2.0.0
 */
exports.left = function (e) { return ({ _tag: 'Left', left: e }); };
/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure
 *
 * @category constructors
 * @since 2.0.0
 */
exports.right = function (a) { return ({ _tag: 'Right', right: a }); };
// TODO: make lazy in v3
/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Right`, if the value is nully use
 * the provided default as a `Left`
 *
 * @example
 * import { fromNullable, left, right } from 'fp-ts/lib/Either'
 *
 * const parse = fromNullable('nully')
 *
 * assert.deepStrictEqual(parse(1), right(1))
 * assert.deepStrictEqual(parse(null), left('nully'))
 *
 * @category constructors
 * @since 2.0.0
 */
function fromNullable(e) {
    return function (a) { return (a == null ? exports.left(e) : exports.right(a)); };
}
exports.fromNullable = fromNullable;
// TODO: `onError => Lazy<A> => Either` in v3
/**
 * Constructs a new `Either` from a function that might throw
 *
 * @example
 * import { Either, left, right, tryCatch } from 'fp-ts/lib/Either'
 *
 * const unsafeHead = <A>(as: Array<A>): A => {
 *   if (as.length > 0) {
 *     return as[0]
 *   } else {
 *     throw new Error('empty array')
 *   }
 * }
 *
 * const head = <A>(as: Array<A>): Either<Error, A> => {
 *   return tryCatch(() => unsafeHead(as), e => (e instanceof Error ? e : new Error('unknown error')))
 * }
 *
 * assert.deepStrictEqual(head([]), left(new Error('empty array')))
 * assert.deepStrictEqual(head([1, 2, 3]), right(1))
 *
 * @category constructors
 * @since 2.0.0
 */
function tryCatch(f, onError) {
    try {
        return exports.right(f());
    }
    catch (e) {
        return exports.left(onError(e));
    }
}
exports.tryCatch = tryCatch;
// TODO curry in v3
/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 *
 * @example
 * import { parseJSON, toError, right, left } from 'fp-ts/lib/Either'
 *
 * assert.deepStrictEqual(parseJSON('{"a":1}', toError), right({ a: 1 }))
 * assert.deepStrictEqual(parseJSON('{"a":}', toError), left(new SyntaxError('Unexpected token } in JSON at position 5')))
 *
 * @category constructors
 * @since 2.0.0
 */
function parseJSON(s, onError) {
    return tryCatch(function () { return JSON.parse(s); }, onError);
}
exports.parseJSON = parseJSON;
// TODO curry in v3
/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 *
 * @example
 * import * as E from 'fp-ts/lib/Either'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.deepStrictEqual(E.stringifyJSON({ a: 1 }, E.toError), E.right('{"a":1}'))
 * const circular: any = { ref: null }
 * circular.ref = circular
 * assert.deepStrictEqual(
 *   pipe(
 *     E.stringifyJSON(circular, E.toError),
 *     E.mapLeft(e => e.message.includes('Converting circular structure to JSON'))
 *   ),
 *   E.left(true)
 * )
 *
 * @category constructors
 * @since 2.0.0
 */
function stringifyJSON(u, onError) {
    return tryCatch(function () { return JSON.stringify(u); }, onError);
}
exports.stringifyJSON = stringifyJSON;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * Takes two functions and an `Either` value, if the value is a `Left` the inner value is applied to the first function,
 * if the value is a `Right` the inner value is applied to the second function.
 *
 * @example
 * import { fold, left, right } from 'fp-ts/lib/Either'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * function onLeft(errors: Array<string>): string {
 *   return `Errors: ${errors.join(', ')}`
 * }
 *
 * function onRight(value: number): string {
 *   return `Ok: ${value}`
 * }
 *
 * assert.strictEqual(
 *   pipe(
 *     right(1),
 *     fold(onLeft, onRight)
 *   ),
 *   'Ok: 1'
 * )
 * assert.strictEqual(
 *   pipe(
 *     left(['error 1', 'error 2']),
 *     fold(onLeft, onRight)
 *   ),
 *   'Errors: error 1, error 2'
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
function fold(onLeft, onRight) {
    return function (ma) { return (exports.isLeft(ma) ? onLeft(ma.left) : onRight(ma.right)); };
}
exports.fold = fold;
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) {
    return exports.isLeft(ma) ? onLeft(ma.left) : ma.right;
}; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
function swap(ma) {
    return exports.isLeft(ma) ? exports.right(ma.left) : exports.left(ma.right);
}
exports.swap = swap;
/**
 * @category combinators
 * @since 2.0.0
 */
function orElse(onLeft) {
    return function (ma) { return (exports.isLeft(ma) ? onLeft(ma.left) : ma); };
}
exports.orElse = orElse;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) { return function (ma) {
    return chain_(ma, function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
}; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (ma, f) { return (exports.isLeft(ma) ? ma : exports.right(f(ma.right))); };
var ap_ = function (mab, ma) { return (exports.isLeft(mab) ? mab : exports.isLeft(ma) ? ma : exports.right(mab.right(ma.right))); };
var chain_ = function (ma, f) {
    return exports.isLeft(ma) ? ma : f(ma.right);
};
var reduce_ = function (fa, b, f) { return (exports.isLeft(fa) ? b : f(b, fa.right)); };
var foldMap_ = function (M) { return function (fa, f) { return (exports.isLeft(fa) ? M.empty : f(fa.right)); }; };
var reduceRight_ = function (fa, b, f) { return (exports.isLeft(fa) ? b : f(fa.right, b)); };
var traverse_ = function (F) { return function (ma, f) {
    return exports.isLeft(ma) ? F.of(exports.left(ma.left)) : F.map(f(ma.right), exports.right);
}; };
var bimap_ = function (fea, f, g) { return (exports.isLeft(fea) ? exports.left(f(fea.left)) : exports.right(g(fea.right))); };
var mapLeft_ = function (fea, f) { return (exports.isLeft(fea) ? exports.left(f(fea.left)) : fea); };
var alt_ = function (fa, that) { return (exports.isLeft(fa) ? that() : fa); };
var extend_ = function (wa, f) { return (exports.isLeft(wa) ? wa : exports.right(f(wa))); };
var chainRec_ = function (a, f) {
    return ChainRec_1.tailRec(f(a), function (e) {
        return exports.isLeft(e) ? exports.right(exports.left(e.left)) : exports.isLeft(e.right) ? exports.left(f(e.right.left)) : exports.right(exports.right(e.right.right));
    });
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
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = function (f, g) { return function (fa) { return bimap_(fa, f, g); }; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return function (fa) { return mapLeft_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) {
    return ap_(fab, fa);
}; };
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
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) { return chain_(ma, f); }; };
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
exports.chainFirst = function (f) { return function (ma) {
    return chain_(ma, function (a) { return map_(f(a), function () { return a; }); });
}; };
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = function (mma) { return chain_(mma, function_1.identity); };
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return function (fa) {
    return alt_(fa, that);
}; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = function (wa) { return extend_(wa, function_1.identity); };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (ma) {
    return extend_(ma, f);
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) {
    return reduce_(fa, b, f);
}; };
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
exports.reduceRight = function (b, f) { return function (fa) {
    return reduceRight_(fa, b, f);
}; };
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.traverse = function (F) {
    var traverseF = traverse_(F);
    return function (f) { return function (fa) { return traverseF(fa, f); }; };
};
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ma) {
    return exports.isLeft(ma) ? F.of(exports.left(ma.left)) : F.map(ma.right, exports.right);
}; };
/**
 * @category MonadThrow
 * @since 2.6.3
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Either';
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(SE, SA) {
    return {
        show: function (ma) { return (exports.isLeft(ma) ? "left(" + SE.show(ma.left) + ")" : "right(" + SA.show(ma.right) + ")"); }
    };
}
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
function getEq(EL, EA) {
    return {
        equals: function (x, y) {
            return x === y || (exports.isLeft(x) ? exports.isLeft(y) && EL.equals(x.left, y.left) : exports.isRight(y) && EA.equals(x.right, y.right));
        }
    };
}
exports.getEq = getEq;
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @example
 * import { getSemigroup, left, right } from 'fp-ts/lib/Either'
 * import { semigroupSum } from 'fp-ts/lib/Semigroup'
 *
 * const S = getSemigroup<string, number>(semigroupSum)
 * assert.deepStrictEqual(S.concat(left('a'), left('b')), left('a'))
 * assert.deepStrictEqual(S.concat(left('a'), right(2)), right(2))
 * assert.deepStrictEqual(S.concat(right(1), left('b')), right(1))
 * assert.deepStrictEqual(S.concat(right(1), right(2)), right(3))
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return (exports.isLeft(y) ? x : exports.isLeft(x) ? y : exports.right(S.concat(x.right, y.right))); }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @example
 * import { getApplySemigroup, left, right } from 'fp-ts/lib/Either'
 * import { semigroupSum } from 'fp-ts/lib/Semigroup'
 *
 * const S = getApplySemigroup<string, number>(semigroupSum)
 * assert.deepStrictEqual(S.concat(left('a'), left('b')), left('a'))
 * assert.deepStrictEqual(S.concat(left('a'), right(2)), left('a'))
 * assert.deepStrictEqual(S.concat(right(1), left('b')), left('b'))
 * assert.deepStrictEqual(S.concat(right(1), right(2)), right(3))
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return {
        concat: function (x, y) { return (exports.isLeft(x) ? x : exports.isLeft(y) ? y : exports.right(S.concat(x.right, y.right))); }
    };
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * Builds `Witherable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 2.0.0
 */
function getWitherable(M) {
    var empty = exports.left(M.empty);
    var compact = function (ma) {
        return exports.isLeft(ma) ? ma : ma.right._tag === 'None' ? exports.left(M.empty) : exports.right(ma.right.value);
    };
    var separate = function (ma) {
        return exports.isLeft(ma)
            ? { left: ma, right: ma }
            : exports.isLeft(ma.right)
                ? { left: exports.right(ma.right.left), right: empty }
                : { left: empty, right: exports.right(ma.right.right) };
    };
    var partitionMap = function (ma, f) {
        if (exports.isLeft(ma)) {
            return { left: ma, right: ma };
        }
        var e = f(ma.right);
        return exports.isLeft(e) ? { left: exports.right(e.left), right: empty } : { left: empty, right: exports.right(e.right) };
    };
    var partition = function (ma, p) {
        return exports.isLeft(ma)
            ? { left: ma, right: ma }
            : p(ma.right)
                ? { left: empty, right: exports.right(ma.right) }
                : { left: exports.right(ma.right), right: empty };
    };
    var filterMap = function (ma, f) {
        if (exports.isLeft(ma)) {
            return ma;
        }
        var ob = f(ma.right);
        return ob._tag === 'None' ? exports.left(M.empty) : exports.right(ob.value);
    };
    var filter = function (ma, predicate) {
        return exports.isLeft(ma) ? ma : predicate(ma.right) ? ma : exports.left(M.empty);
    };
    var wither = function (F) {
        var traverseF = traverse_(F);
        return function (ma, f) { return F.map(traverseF(ma, f), compact); };
    };
    var wilt = function (F) {
        var traverseF = traverse_(F);
        return function (ma, f) { return F.map(traverseF(ma, f), separate); };
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: compact,
        separate: separate,
        filter: filter,
        filterMap: filterMap,
        partition: partition,
        partitionMap: partitionMap,
        traverse: traverse_,
        sequence: exports.sequence,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        wither: wither,
        wilt: wilt
    };
}
exports.getWitherable = getWitherable;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeValidation(SE) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) {
            return exports.isLeft(fab)
                ? exports.isLeft(fa)
                    ? exports.left(SE.concat(fab.left, fa.left))
                    : fab
                : exports.isLeft(fa)
                    ? fa
                    : exports.right(fab.right(fa.right));
        },
        of: exports.of
    };
}
exports.getApplicativeValidation = getApplicativeValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltValidation(SE) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) {
            if (exports.isRight(me)) {
                return me;
            }
            var ea = that();
            return exports.isLeft(ea) ? exports.left(SE.concat(me.left, ea.left)) : ea;
        }
    };
}
exports.getAltValidation = getAltValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
function getValidation(SE) {
    var applicativeValidation = getApplicativeValidation(SE);
    var altValidation = getAltValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        of: exports.of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        extend: extend_,
        traverse: traverse_,
        sequence: exports.sequence,
        chainRec: chainRec_,
        throwError: exports.throwError,
        ap: applicativeValidation.ap,
        alt: altValidation.alt
    };
}
exports.getValidation = getValidation;
/**
 * @category instances
 * @since 2.0.0
 */
function getValidationSemigroup(SE, SA) {
    return {
        concat: function (x, y) {
            return exports.isLeft(x) ? (exports.isLeft(y) ? exports.left(SE.concat(x.left, y.left)) : x) : exports.isLeft(y) ? y : exports.right(SA.concat(x.right, y.right));
        }
    };
}
exports.getValidationSemigroup = getValidationSemigroup;
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
/**
 * @category instances
 * @since 2.7.0
 */
exports.Extend = {
    URI: exports.URI,
    map: map_,
    extend: extend_
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
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
function getValidationMonoid(SE, SA) {
    return {
        concat: getValidationSemigroup(SE, SA).concat,
        empty: exports.right(SA.empty)
    };
}
exports.getValidationMonoid = getValidationMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
exports.either = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    extend: extend_,
    chainRec: chainRec_,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Default value for the `onError` argument of `tryCatch`
 *
 * @since 2.0.0
 */
function toError(e) {
    return e instanceof Error ? e : new Error(String(e));
}
exports.toError = toError;
/**
 * @since 2.0.0
 */
function elem(E) {
    return function (a, ma) { return (exports.isLeft(ma) ? false : E.equals(a, ma.right)); };
}
exports.elem = elem;
/**
 * Returns `false` if `Left` or returns the result of the application of the given predicate to the `Right` value.
 *
 * @example
 * import { exists, left, right } from 'fp-ts/lib/Either'
 *
 * const gt2 = exists((n: number) => n > 2)
 *
 * assert.strictEqual(gt2(left('a')), false)
 * assert.strictEqual(gt2(right(1)), false)
 * assert.strictEqual(gt2(right(3)), true)
 *
 * @since 2.0.0
 */
function exists(predicate) {
    return function (ma) { return (exports.isLeft(ma) ? false : predicate(ma.right)); };
}
exports.exists = exists;
