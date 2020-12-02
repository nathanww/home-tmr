/**
 * ```ts
 * type Either<E, A> = Left<E> | Right<A>
 * ```
 *
 * Represents a value of one of two possible types (a disjoint union).
 *
 * An instance of `Either` is either an instance of `Left` or `Right`.
 *
 * A common use of `Either` is as an alternative to `Option` for dealing with possible missing values. In this usage,
 * `None` is replaced with a `Left` which can contain useful information. `Right` takes the place of `Some`. Convention
 * dictates that `Left` is used for failure and `Right` is used for success.
 *
 * @since 2.0.0
 */
import { Alt2, Alt2C } from './Alt'
import { Applicative2, Applicative2C } from './Applicative'
import { Bifunctor2 } from './Bifunctor'
import { ChainRec2, ChainRec2C } from './ChainRec'
import { Eq } from './Eq'
import { Extend2 } from './Extend'
import { Foldable2 } from './Foldable'
import { Lazy, Predicate, Refinement } from './function'
import { Functor2 } from './Functor'
import { Monad2, Monad2C } from './Monad'
import { MonadThrow2, MonadThrow2C } from './MonadThrow'
import { Monoid } from './Monoid'
import { Option } from './Option'
import { Semigroup } from './Semigroup'
import { Show } from './Show'
import { PipeableTraverse2, Traversable2 } from './Traversable'
import { Witherable2C } from './Witherable'
/**
 * @category model
 * @since 2.0.0
 */
export interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}
/**
 * @category model
 * @since 2.0.0
 */
export interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}
/**
 * @category model
 * @since 2.0.0
 */
export declare type Either<E, A> = Left<E> | Right<A>
/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isLeft: <E, A>(ma: Either<E, A>) => ma is Left<E>
/**
 * Returns `true` if the either is an instance of `Right`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isRight: <E, A>(ma: Either<E, A>) => ma is Right<A>
/**
 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
 * structure
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const left: <E = never, A = never>(e: E) => Either<E, A>
/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const right: <E = never, A = never>(a: A) => Either<E, A>
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
export declare function fromNullable<E>(e: E): <A>(a: A) => Either<E, NonNullable<A>>
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
export declare function tryCatch<E, A>(f: Lazy<A>, onError: (e: unknown) => E): Either<E, A>
/**
 * Copied from https://github.com/Microsoft/TypeScript/issues/1897#issuecomment-338650717
 *
 * @since 2.6.7
 */
export declare type Json = boolean | number | string | null | JsonArray | JsonRecord
/**
 * @since 2.6.7
 */
export interface JsonRecord {
  readonly [key: string]: Json
}
/**
 * @since 2.6.7
 */
export interface JsonArray extends ReadonlyArray<Json> {}
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
export declare function parseJSON<E>(s: string, onError: (reason: unknown) => E): Either<E, Json>
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
export declare function stringifyJSON<E>(u: unknown, onError: (reason: unknown) => E): Either<E, string>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromOption: <E>(onNone: Lazy<E>) => <A>(ma: Option<A>) => Either<E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (a: A) => Either<E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => Either<E, A>
}
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
export declare function fold<E, A, B>(onLeft: (e: E) => B, onRight: (a: A) => B): (ma: Either<E, A>) => B
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export declare const getOrElseW: <E, B>(onLeft: (e: E) => B) => <A>(ma: Either<E, A>) => B | A
/**
 * @category destructors
 * @since 2.0.0
 */
export declare const getOrElse: <E, A>(onLeft: (e: E) => A) => (ma: Either<E, A>) => A
/**
 * @category combinators
 * @since 2.0.0
 */
export declare function swap<E, A>(ma: Either<E, A>): Either<A, E>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare function orElse<E, A, M>(onLeft: (e: E) => Either<M, A>): (ma: Either<E, A>) => Either<M, A>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (ma: Either<E, A>) => Either<E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (ma: Either<E, A>) => Either<E, A>
}
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
export declare const map: <A, B>(f: (a: A) => B) => <E>(fa: Either<E, A>) => Either<E, B>
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export declare const bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fa: Either<E, A>) => Either<G, B>
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export declare const mapLeft: <E, G>(f: (e: E) => G) => <A>(fa: Either<E, A>) => Either<G, A>
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const ap: <E, A>(fa: Either<E, A>) => <B>(fab: Either<E, (a: A) => B>) => Either<E, B>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apFirst: <E, B>(fb: Either<E, B>) => <A>(fa: Either<E, A>) => Either<E, A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apSecond: <E, B>(fb: Either<E, B>) => <A>(fa: Either<E, A>) => Either<E, B>
/**
 * @category Applicative
 * @since 2.7.0
 */
export declare const of: Applicative2<URI>['of']
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export declare const chainW: <D, A, B>(f: (a: A) => Either<D, B>) => <E>(ma: Either<E, A>) => Either<D | E, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chain: <E, A, B>(f: (a: A) => Either<E, B>) => (ma: Either<E, A>) => Either<E, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chainFirst: <E, A, B>(f: (a: A) => Either<E, B>) => (ma: Either<E, A>) => Either<E, A>
/**
 * @category Monad
 * @since 2.0.0
 */
export declare const flatten: <E, A>(mma: Either<E, Either<E, A>>) => Either<E, A>
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export declare const alt: <E, A>(that: Lazy<Either<E, A>>) => (fa: Either<E, A>) => Either<E, A>
/**
 * @category Extend
 * @since 2.0.0
 */
export declare const duplicate: <E, A>(ma: Either<E, A>) => Either<E, Either<E, A>>
/**
 * @category Extend
 * @since 2.0.0
 */
export declare const extend: <E, A, B>(f: (wa: Either<E, A>) => B) => (wa: Either<E, A>) => Either<E, B>
/**
 * @category Foldable
 * @since 2.0.0
 */
export declare const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: Either<E, A>) => B
/**
 * @category Foldable
 * @since 2.0.0
 */
export declare const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => <E>(fa: Either<E, A>) => M
/**
 * @category Foldable
 * @since 2.0.0
 */
export declare const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: Either<E, A>) => B
/**
 * @category Traversable
 * @since 2.6.3
 */
export declare const traverse: PipeableTraverse2<URI>
/**
 * @category Traversable
 * @since 2.6.3
 */
export declare const sequence: Traversable2<URI>['sequence']
/**
 * @category MonadThrow
 * @since 2.6.3
 */
export declare const throwError: MonadThrow2<URI>['throwError']
/**
 * @category instances
 * @since 2.0.0
 */
export declare const URI = 'Either'
/**
 * @category instances
 * @since 2.0.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Either<E, A>
  }
}
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getShow<E, A>(SE: Show<E>, SA: Show<A>): Show<Either<E, A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getEq<E, A>(EL: Eq<E>, EA: Eq<A>): Eq<Either<E, A>>
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
export declare function getSemigroup<E, A>(S: Semigroup<A>): Semigroup<Either<E, A>>
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
export declare function getApplySemigroup<E, A>(S: Semigroup<A>): Semigroup<Either<E, A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getApplyMonoid<E, A>(M: Monoid<A>): Monoid<Either<E, A>>
/**
 * Builds `Witherable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getWitherable<E>(M: Monoid<E>): Witherable2C<URI, E>
/**
 * @category instances
 * @since 2.7.0
 */
export declare function getApplicativeValidation<E>(SE: Semigroup<E>): Applicative2C<URI, E>
/**
 * @category instances
 * @since 2.7.0
 */
export declare function getAltValidation<E>(SE: Semigroup<E>): Alt2C<URI, E>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getValidation<E>(
  SE: Semigroup<E>
): Monad2C<URI, E> &
  Foldable2<URI> &
  Traversable2<URI> &
  Bifunctor2<URI> &
  Alt2C<URI, E> &
  Extend2<URI> &
  ChainRec2C<URI, E> &
  MonadThrow2C<URI, E>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getValidationSemigroup<E, A>(SE: Semigroup<E>, SA: Semigroup<A>): Semigroup<Either<E, A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Applicative: Applicative2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Monad: Monad2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Foldable: Foldable2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Traversable: Traversable2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Bifunctor: Bifunctor2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Alt: Alt2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Extend: Extend2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ChainRec: ChainRec2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const MonadThrow: MonadThrow2<URI>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getValidationMonoid<E, A>(SE: Semigroup<E>, SA: Monoid<A>): Monoid<Either<E, A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare const either: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Bifunctor2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  ChainRec2<URI> &
  MonadThrow2<URI>
/**
 * Default value for the `onError` argument of `tryCatch`
 *
 * @since 2.0.0
 */
export declare function toError(e: unknown): Error
/**
 * @since 2.0.0
 */
export declare function elem<A>(E: Eq<A>): <E>(a: A, ma: Either<E, A>) => boolean
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
export declare function exists<A>(predicate: Predicate<A>): <E>(ma: Either<E, A>) => boolean
