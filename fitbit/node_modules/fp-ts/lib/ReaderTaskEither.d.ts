/**
 * @since 2.0.0
 */
import { Alt3, Alt3C } from './Alt'
import { Applicative3, Applicative3C } from './Applicative'
import { Apply1 } from './Apply'
import { Bifunctor3 } from './Bifunctor'
import * as E from './Either'
import { Lazy, Predicate, Refinement } from './function'
import { Functor3 } from './Functor'
import { IO } from './IO'
import { IOEither } from './IOEither'
import { Monad3, Monad3C } from './Monad'
import { MonadIO3 } from './MonadIO'
import { MonadTask3, MonadTask3C } from './MonadTask'
import { MonadThrow3, MonadThrow3C } from './MonadThrow'
import { Monoid } from './Monoid'
import { Option } from './Option'
import * as R from './Reader'
import { ReaderEither } from './ReaderEither'
import * as RT from './ReaderTask'
import { Semigroup } from './Semigroup'
import * as T from './Task'
import * as TE from './TaskEither'
import Either = E.Either
import Task = T.Task
import TaskEither = TE.TaskEither
import Reader = R.Reader
import ReaderTask = RT.ReaderTask
/**
 * @category model
 * @since 2.0.0
 */
export interface ReaderTaskEither<R, E, A> {
  (r: R): TaskEither<E, A>
}
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function left<R, E = never, A = never>(e: E): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const right: <R, E = never, A = never>(a: A) => ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function rightTask<R, E = never, A = never>(ma: Task<A>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function leftTask<R, E = never, A = never>(me: Task<E>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromTaskEither: <R, E, A>(ma: TaskEither<E, A>) => ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const rightReader: <R, E = never, A = never>(ma: Reader<R, A>) => ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.5.0
 */
export declare function leftReaderTask<R, E = never, A = never>(me: ReaderTask<R, E>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.5.0
 */
export declare function rightReaderTask<R, E = never, A = never>(ma: ReaderTask<R, A>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function leftReader<R, E = never, A = never>(me: Reader<R, E>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function fromIOEither<R, E, A>(ma: IOEither<E, A>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function fromReaderEither<R, E, A>(ma: ReaderEither<R, E, A>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function rightIO<R, E = never, A = never>(ma: IO<A>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare function leftIO<R, E = never, A = never>(me: IO<E>): ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const ask: <R, E = never>() => ReaderTaskEither<R, E, R>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const asks: <R, E = never, A = never>(f: (r: R) => A) => ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromEither: <R, E, A>(ma: Either<E, A>) => ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromOption: <E>(onNone: Lazy<E>) => <R, A>(ma: Option<A>) => ReaderTaskEither<R, E, A>
/**
 * @category constructors
 * @since 2.0.0
 */
export declare const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <U>(a: A) => ReaderTaskEither<U, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(a: A) => ReaderTaskEither<R, E, A>
}
/**
 * @category destructors
 * @since 2.0.0
 */
export declare function fold<R, E, A, B>(
  onLeft: (e: E) => ReaderTask<R, B>,
  onRight: (a: A) => ReaderTask<R, B>
): (ma: ReaderTaskEither<R, E, A>) => ReaderTask<R, B>
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export declare const getOrElseW: <R, E, B>(
  onLeft: (e: E) => RT.ReaderTask<R, B>
) => <Q, A>(ma: ReaderTaskEither<Q, E, A>) => RT.ReaderTask<Q & R, B | A>
/**
 * @category destructors
 * @since 2.0.0
 */
export declare const getOrElse: <R, E, A>(
  onLeft: (e: E) => ReaderTask<R, A>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTask<R, A>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare function orElse<R, E, A, M>(
  onLeft: (e: E) => ReaderTaskEither<R, M, A>
): (ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, M, A>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare function swap<R, E, A>(ma: ReaderTaskEither<R, E, A>): ReaderTaskEither<R, A, E>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare const local: <Q, R>(f: (f: Q) => R) => <E, A>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<Q, E, A>
/**
 * @category combinators
 * @since 2.0.0
 */
export declare const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <R>(
    ma: ReaderTaskEither<R, E, A>
  ) => ReaderTaskEither<R, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>
}
/**
 * @category combinators
 * @since 2.4.0
 */
export declare function fromEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Either<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B>
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export declare const chainEitherKW: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R, D>(ma: ReaderTaskEither<R, D, A>) => ReaderTaskEither<R, D | E, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare const chainEitherK: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare function fromIOEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => IOEither<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B>
/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export declare const chainIOEitherKW: <E, A, B>(
  f: (a: A) => IOEither<E, B>
) => <R, D>(ma: ReaderTaskEither<R, D, A>) => ReaderTaskEither<R, D | E, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare const chainIOEitherK: <E, A, B>(
  f: (a: A) => IOEither<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare function fromTaskEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => TaskEither<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B>
/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export declare const chainTaskEitherKW: <E, A, B>(
  f: (a: A) => TaskEither<E, B>
) => <R, D>(ma: ReaderTaskEither<R, D, A>) => ReaderTaskEither<R, D | E, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare const chainTaskEitherK: <E, A, B>(
  f: (a: A) => TaskEither<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B>
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
export declare const map: <A, B>(f: (a: A) => B) => <R, E>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B>
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export declare const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => <R>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, G, B>
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export declare const mapLeft: <E, G>(
  f: (e: E) => G
) => <R, A>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, G, A>
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const ap: <R, E, A>(
  fa: ReaderTaskEither<R, E, A>
) => <B>(fab: ReaderTaskEither<R, E, (a: A) => B>) => ReaderTaskEither<R, E, B>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apFirst: <R, E, B>(
  fb: ReaderTaskEither<R, E, B>
) => <A>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apSecond: <R, E, B>(
  fb: ReaderTaskEither<R, E, B>
) => <A>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B>
/**
 * @category Applicative
 * @since 2.7.0
 */
export declare const of: Applicative3<URI>['of']
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export declare const chainW: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => <Q, D>(ma: ReaderTaskEither<Q, D, A>) => ReaderTaskEither<Q & R, D | E, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chain: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chainFirst: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>
/**
 * @category Monad
 * @since 2.0.0
 */
export declare const flatten: <R, E, A>(
  mma: ReaderTaskEither<R, E, ReaderTaskEither<R, E, A>>
) => ReaderTaskEither<R, E, A>
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export declare const alt: <R, E, A>(
  that: () => ReaderTaskEither<R, E, A>
) => (fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>
/**
 * @category MonadIO
 * @since 2.0.0
 */
export declare const fromIO: MonadIO3<URI>['fromIO']
/**
 * @category MonadTask
 * @since 2.0.0
 */
export declare const fromTask: MonadTask3<URI>['fromTask']
/**
 * @category MonadThrow
 * @since 2.0.0
 */
export declare const throwError: MonadThrow3<URI>['throwError']
/**
 * @category instances
 * @since 2.0.0
 */
export declare const URI = 'ReaderTaskEither'
/**
 * @category instances
 * @since 2.0.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: ReaderTaskEither<R, E, A>
  }
}
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getSemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderTaskEither<R, E, A>>
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getApplySemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderTaskEither<R, E, A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getApplyMonoid<R, E, A>(M: Monoid<A>): Monoid<ReaderTaskEither<R, E, A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare function getApplicativeReaderTaskValidation<E>(A: Apply1<T.URI>, SE: Semigroup<E>): Applicative3C<URI, E>
/**
 * @category instances
 * @since 2.7.0
 */
export declare function getAltReaderTaskValidation<E>(SE: Semigroup<E>): Alt3C<URI, E>
/**
 * @category instances
 * @since 2.3.0
 */
export declare function getReaderTaskValidation<E>(
  SE: Semigroup<E>
): Monad3C<URI, E> & Bifunctor3<URI> & Alt3C<URI, E> & MonadTask3C<URI, E> & MonadThrow3C<URI, E>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ApplicativePar: Applicative3<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ApplicativeSeq: Applicative3<URI>
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
 * @since 2.0.0
 */
export declare const readerTaskEither: Monad3<URI> & Bifunctor3<URI> & Alt3<URI> & MonadTask3<URI> & MonadThrow3<URI>
/**
 * Like `readerTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
export declare const readerTaskEitherSeq: typeof readerTaskEither
/**
 * @since 2.0.0
 */
export declare function run<R, E, A>(ma: ReaderTaskEither<R, E, A>, r: R): Promise<Either<E, A>>
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.4
 */
export declare function bracket<R, E, A, B>(
  aquire: ReaderTaskEither<R, E, A>,
  use: (a: A) => ReaderTaskEither<R, E, B>,
  release: (a: A, e: Either<E, B>) => ReaderTaskEither<R, E, void>
): ReaderTaskEither<R, E, B>
