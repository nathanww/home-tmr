import { tailRec } from './ChainRec';
import { identity } from './function';
// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
export var isLeft = function (ma) { return ma._tag === 'Left'; };
/**
 * Returns `true` if the either is an instance of `Right`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
export var isRight = function (ma) { return ma._tag === 'Right'; };
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
export var left = function (e) { return ({ _tag: 'Left', left: e }); };
/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure
 *
 * @category constructors
 * @since 2.0.0
 */
export var right = function (a) { return ({ _tag: 'Right', right: a }); };
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
export function fromNullable(e) {
    return function (a) { return (a == null ? left(e) : right(a)); };
}
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
export function tryCatch(f, onError) {
    try {
        return right(f());
    }
    catch (e) {
        return left(onError(e));
    }
}
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
export function parseJSON(s, onError) {
    return tryCatch(function () { return JSON.parse(s); }, onError);
}
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
export function stringifyJSON(u, onError) {
    return tryCatch(function () { return JSON.stringify(u); }, onError);
}
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? left(onNone()) : right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
export var fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); }; };
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
export function fold(onLeft, onRight) {
    return function (ma) { return (isLeft(ma) ? onLeft(ma.left) : onRight(ma.right)); };
}
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export var getOrElseW = function (onLeft) { return function (ma) {
    return isLeft(ma) ? onLeft(ma.left) : ma.right;
}; };
/**
 * @category destructors
 * @since 2.0.0
 */
export var getOrElse = getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
export function swap(ma) {
    return isLeft(ma) ? right(ma.left) : left(ma.right);
}
/**
 * @category combinators
 * @since 2.0.0
 */
export function orElse(onLeft) {
    return function (ma) { return (isLeft(ma) ? onLeft(ma.left) : ma); };
}
/**
 * @category combinators
 * @since 2.0.0
 */
export var filterOrElse = function (predicate, onFalse) { return function (ma) {
    return chain_(ma, function (a) { return (predicate(a) ? right(a) : left(onFalse(a))); });
}; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (ma, f) { return (isLeft(ma) ? ma : right(f(ma.right))); };
var ap_ = function (mab, ma) { return (isLeft(mab) ? mab : isLeft(ma) ? ma : right(mab.right(ma.right))); };
var chain_ = function (ma, f) {
    return isLeft(ma) ? ma : f(ma.right);
};
var reduce_ = function (fa, b, f) { return (isLeft(fa) ? b : f(b, fa.right)); };
var foldMap_ = function (M) { return function (fa, f) { return (isLeft(fa) ? M.empty : f(fa.right)); }; };
var reduceRight_ = function (fa, b, f) { return (isLeft(fa) ? b : f(fa.right, b)); };
var traverse_ = function (F) { return function (ma, f) {
    return isLeft(ma) ? F.of(left(ma.left)) : F.map(f(ma.right), right);
}; };
var bimap_ = function (fea, f, g) { return (isLeft(fea) ? left(f(fea.left)) : right(g(fea.right))); };
var mapLeft_ = function (fea, f) { return (isLeft(fea) ? left(f(fea.left)) : fea); };
var alt_ = function (fa, that) { return (isLeft(fa) ? that() : fa); };
var extend_ = function (wa, f) { return (isLeft(wa) ? wa : right(f(wa))); };
var chainRec_ = function (a, f) {
    return tailRec(f(a), function (e) {
        return isLeft(e) ? right(left(e.left)) : isLeft(e.right) ? left(f(e.right.left)) : right(right(e.right.right));
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
export var map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var bimap = function (f, g) { return function (fa) { return bimap_(fa, f, g); }; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export var mapLeft = function (f) { return function (fa) { return mapLeft_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export var ap = function (fa) { return function (fab) {
    return ap_(fab, fa);
}; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apFirst = function (fb) { return function (fa) {
    return ap_(map_(fa, function (a) { return function () { return a; }; }), fb);
}; };
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export var apSecond = function (fb) { return function (fa) {
    return ap_(map_(fa, function () { return function (b) { return b; }; }), fb);
}; };
/**
 * @category Applicative
 * @since 2.7.0
 */
export var of = right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export var chainW = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export var chain = chainW;
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
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export var alt = function (that) { return function (fa) {
    return alt_(fa, that);
}; };
/**
 * @category Extend
 * @since 2.0.0
 */
export var duplicate = function (wa) { return extend_(wa, identity); };
/**
 * @category Extend
 * @since 2.0.0
 */
export var extend = function (f) { return function (ma) {
    return extend_(ma, f);
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
export var reduce = function (b, f) { return function (fa) {
    return reduce_(fa, b, f);
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
export var foldMap = function (M) {
    var foldMapM = foldMap_(M);
    return function (f) { return function (fa) { return foldMapM(fa, f); }; };
};
/**
 * @category Foldable
 * @since 2.0.0
 */
export var reduceRight = function (b, f) { return function (fa) {
    return reduceRight_(fa, b, f);
}; };
/**
 * @category Traversable
 * @since 2.6.3
 */
export var traverse = function (F) {
    var traverseF = traverse_(F);
    return function (f) { return function (fa) { return traverseF(fa, f); }; };
};
/**
 * @category Traversable
 * @since 2.6.3
 */
export var sequence = function (F) { return function (ma) {
    return isLeft(ma) ? F.of(left(ma.left)) : F.map(ma.right, right);
}; };
/**
 * @category MonadThrow
 * @since 2.6.3
 */
export var throwError = left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
export var URI = 'Either';
/**
 * @category instances
 * @since 2.0.0
 */
export function getShow(SE, SA) {
    return {
        show: function (ma) { return (isLeft(ma) ? "left(" + SE.show(ma.left) + ")" : "right(" + SA.show(ma.right) + ")"); }
    };
}
/**
 * @category instances
 * @since 2.0.0
 */
export function getEq(EL, EA) {
    return {
        equals: function (x, y) {
            return x === y || (isLeft(x) ? isLeft(y) && EL.equals(x.left, y.left) : isRight(y) && EA.equals(x.right, y.right));
        }
    };
}
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
export function getSemigroup(S) {
    return {
        concat: function (x, y) { return (isLeft(y) ? x : isLeft(x) ? y : right(S.concat(x.right, y.right))); }
    };
}
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
export function getApplySemigroup(S) {
    return {
        concat: function (x, y) { return (isLeft(x) ? x : isLeft(y) ? y : right(S.concat(x.right, y.right))); }
    };
}
/**
 * @category instances
 * @since 2.0.0
 */
export function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: right(M.empty)
    };
}
/**
 * Builds `Witherable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 2.0.0
 */
export function getWitherable(M) {
    var empty = left(M.empty);
    var compact = function (ma) {
        return isLeft(ma) ? ma : ma.right._tag === 'None' ? left(M.empty) : right(ma.right.value);
    };
    var separate = function (ma) {
        return isLeft(ma)
            ? { left: ma, right: ma }
            : isLeft(ma.right)
                ? { left: right(ma.right.left), right: empty }
                : { left: empty, right: right(ma.right.right) };
    };
    var partitionMap = function (ma, f) {
        if (isLeft(ma)) {
            return { left: ma, right: ma };
        }
        var e = f(ma.right);
        return isLeft(e) ? { left: right(e.left), right: empty } : { left: empty, right: right(e.right) };
    };
    var partition = function (ma, p) {
        return isLeft(ma)
            ? { left: ma, right: ma }
            : p(ma.right)
                ? { left: empty, right: right(ma.right) }
                : { left: right(ma.right), right: empty };
    };
    var filterMap = function (ma, f) {
        if (isLeft(ma)) {
            return ma;
        }
        var ob = f(ma.right);
        return ob._tag === 'None' ? left(M.empty) : right(ob.value);
    };
    var filter = function (ma, predicate) {
        return isLeft(ma) ? ma : predicate(ma.right) ? ma : left(M.empty);
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
        URI: URI,
        _E: undefined,
        map: map_,
        compact: compact,
        separate: separate,
        filter: filter,
        filterMap: filterMap,
        partition: partition,
        partitionMap: partitionMap,
        traverse: traverse_,
        sequence: sequence,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        wither: wither,
        wilt: wilt
    };
}
/**
 * @category instances
 * @since 2.7.0
 */
export function getApplicativeValidation(SE) {
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) {
            return isLeft(fab)
                ? isLeft(fa)
                    ? left(SE.concat(fab.left, fa.left))
                    : fab
                : isLeft(fa)
                    ? fa
                    : right(fab.right(fa.right));
        },
        of: of
    };
}
/**
 * @category instances
 * @since 2.7.0
 */
export function getAltValidation(SE) {
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) {
            if (isRight(me)) {
                return me;
            }
            var ea = that();
            return isLeft(ea) ? left(SE.concat(me.left, ea.left)) : ea;
        }
    };
}
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export function getValidation(SE) {
    var applicativeValidation = getApplicativeValidation(SE);
    var altValidation = getAltValidation(SE);
    return {
        URI: URI,
        _E: undefined,
        map: map_,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        extend: extend_,
        traverse: traverse_,
        sequence: sequence,
        chainRec: chainRec_,
        throwError: throwError,
        ap: applicativeValidation.ap,
        alt: altValidation.alt
    };
}
/**
 * @category instances
 * @since 2.0.0
 */
export function getValidationSemigroup(SE, SA) {
    return {
        concat: function (x, y) {
            return isLeft(x) ? (isLeft(y) ? left(SE.concat(x.left, y.left)) : x) : isLeft(y) ? y : right(SA.concat(x.right, y.right));
        }
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
export var Applicative = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Monad = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_
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
export var Alt = {
    URI: URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var Extend = {
    URI: URI,
    map: map_,
    extend: extend_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var ChainRec = {
    URI: URI,
    map: map_,
    ap: ap_,
    chain: chain_,
    chainRec: chainRec_
};
/**
 * @category instances
 * @since 2.7.0
 */
export var MonadThrow = {
    URI: URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    throwError: throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
export function getValidationMonoid(SE, SA) {
    return {
        concat: getValidationSemigroup(SE, SA).concat,
        empty: right(SA.empty)
    };
}
/**
 * @category instances
 * @since 2.0.0
 */
export var either = {
    URI: URI,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    extend: extend_,
    chainRec: chainRec_,
    throwError: throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Default value for the `onError` argument of `tryCatch`
 *
 * @since 2.0.0
 */
export function toError(e) {
    return e instanceof Error ? e : new Error(String(e));
}
/**
 * @since 2.0.0
 */
export function elem(E) {
    return function (a, ma) { return (isLeft(ma) ? false : E.equals(a, ma.right)); };
}
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
export function exists(predicate) {
    return function (ma) { return (isLeft(ma) ? false : predicate(ma.right)); };
}
