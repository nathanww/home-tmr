/**
 * @since 2.0.0
 */
import { Alt3, Alt3C } from './Alt'
import { Applicative3, Applicative3C } from './Applicative'
import { Bifunctor3 } from './Bifunctor'
import * as E from './Either'
import { Predicate, Refinement } from './function'
import { Functor3 } from './Functor'
import { Monad3, Monad3C } from './Monad'
import { MonadThrow3, MonadThrow3C } from './MonadThrow'
import { Monoid } from './Monoid'
import { Option } from './Option'
import * as R from './Reader'
import { Semigroup } from './Semigroup'
import Either = E.Either
import Reader = R.Reader
/**
 * @category model
 * @since 2.0.0
 */
export interface ReaderEither<R, E, A> extends Reader<R, Either<E, A>> {}
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const left: <R, E = never, A = never>(e: E) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const right: <R, E = never, A = never>(a: A) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const rightReader: <R, E = never, A = never>(ma: Reader<R, A>) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const leftReader: <R, E = never, A = never>(me: Reader<R, E>) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const ask: <R, E = never>() => ReaderEither<R, E, R>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const asks: <R, E = never, A = never>(f: (r: R) => A) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromEither: <R, E, A>(ma: E.Either<E, A>) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromOption: <E>(onNone: () => E) => <R, A>(ma: Option<A>) => ReaderEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <U>(a: A) => ReaderEither<U, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(a: A) => ReaderEither<R, E, A>
}
/**
 * @category destructors
 * @since 2.0.0
 */
export declare const fold: <R, E, A, B>(
  onLeft: (e: E) => Reader<R, B>,
  onRight: (a: A) => Reader<R, B>
) => (ma: ReaderEither<R, E, A>) => Reader<R, B>
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export declare const getOrElseW: <R, E, B>(
  onLeft: (e: E) => R.Reader<R, B>
) => <Q, A>(ma: ReaderEither<Q, E, A>) => R.Reader<Q & R, B | A>
/**
 * @category destructors
 * @since 2.0.0
 */
export declare const getOrElse: <E, R, A>(onLeft: (e: E) => Reader<R, A>) => (ma: ReaderEither<R, E, A>) => Reader<R, A>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare const orElse: <E, R, M, A>(
  onLeft: (e: E) => ReaderEither<R, M, A>
) => (ma: ReaderEither<R, E, A>) => ReaderEither<R, M, A>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare const swap: <R, E, A>(ma: ReaderEither<R, E, A>) => ReaderEither<R, A, E>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare function local<Q, R>(f: (f: Q) => R): <E, A>(ma: ReaderEither<R, E, A>) => ReaderEither<Q, E, A>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare function fromEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Either<E, B>
): <R>(...a: A) => ReaderEither<R, E, B>
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export declare const chainEitherKW: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R, D>(ma: ReaderEither<R, D, A>) => ReaderEither<R, D | E, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare const chainEitherK: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R>(ma: ReaderEither<R, E, A>) => ReaderEither<R, E, B>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <R>(
    ma: ReaderEither<R, E, A>
  ) => ReaderEither<R, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(ma: ReaderEither<R, E, A>) => ReaderEither<R, E, A>
}
/**
 * @category Functor
 * @since 2.0.0
 */
export declare const map: <A, B>(f: (a: A) => B) => <R, E>(fa: ReaderEither<R, E, A>) => ReaderEither<R, E, B>
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export declare const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => <R>(fa: ReaderEither<R, E, A>) => ReaderEither<R, G, B>
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export declare const mapLeft: <E, G>(f: (e: E) => G) => <R, A>(fa: ReaderEither<R, E, A>) => ReaderEither<R, G, A>
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const ap: <R, E, A>(
  fa: ReaderEither<R, E, A>
) => <B>(fab: ReaderEither<R, E, (a: A) => B>) => ReaderEither<R, E, B>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apFirst: <R, E, B>(
  fb: ReaderEither<R, E, B>
) => <A>(fa: ReaderEither<R, E, A>) => ReaderEither<R, E, A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apSecond: <R, E, B>(
  fb: ReaderEither<R, E, B>
) => <A>(fa: ReaderEither<R, E, A>) => ReaderEither<R, E, B>
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export declare const chainW: <R, E, A, B>(
  f: (a: A) => ReaderEither<R, E, B>
) => <Q, D>(ma: ReaderEither<Q, D, A>) => ReaderEither<Q & R, E | D, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chain: <R, E, A, B>(
  f: (a: A) => ReaderEither<R, E, B>
) => (ma: ReaderEither<R, E, A>) => ReaderEither<R, E, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chainFirst: <R, E, A, B>(
  f: (a: A) => ReaderEither<R, E, B>
) => (ma: ReaderEither<R, E, A>) => ReaderEither<R, E, A>
/**
 * @category Monad
 * @since 2.0.0
 */
export declare const flatten: <R, E, A>(mma: ReaderEither<R, E, ReaderEither<R, E, A>>) => ReaderEither<R, E, A>
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export declare const alt: <R, E, A>(
  that: () => ReaderEither<R, E, A>
) => (fa: ReaderEither<R, E, A>) => ReaderEither<R, E, A>
/**
 * @category MonadThrow
 * @since 2.7.0
 */
export declare const throwError: MonadThrow3<URI>['throwError']
/**
 * @category instances
 * @since 2.0.0
 */
export declare const URI = 'ReaderEither'
/**
 * @category instances
 * @since 2.0.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: ReaderEither<R, E, A>
  }
}
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getSemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderEither<R, E, A>>
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getApplySemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderEither<R, E, A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getApplyMonoid<R, E, A>(M: Monoid<A>): Monoid<ReaderEither<R, E, A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare function getApplicativeReaderValidation<E>(SE: Semigroup<E>): Applicative3C<URI, E>
/**
 * @category instances
 * @since 2.7.0
 */
export declare function getAltReaderValidation<E>(SE: Semigroup<E>): Alt3C<URI, E>
/**
 * @category instances
 * @since 2.3.0
 */
export declare function getReaderValidation<E>(
  SE: Semigroup<E>
): Monad3C<URI, E> & Bifunctor3<URI> & Alt3C<URI, E> & MonadThrow3C<URI, E>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Applicative: Applicative3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Monad: Monad3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Bifunctor: Bifunctor3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Alt: Alt3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const MonadThrow: MonadThrow3<URI>
/**
 * @category instances
 * @since 2.0.0
 */
export declare const readerEither: Monad3<URI> & Bifunctor3<URI> & Alt3<URI> & MonadThrow3<URI>
