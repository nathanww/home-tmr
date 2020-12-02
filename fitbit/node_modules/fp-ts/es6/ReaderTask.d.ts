import { IO } from './IO'
import { MonadTask2 } from './MonadTask'
import { Monoid } from './Monoid'
import * as R from './Reader'
import { Semigroup } from './Semigroup'
import * as T from './Task'
import Task = T.Task
import Reader = R.Reader
import { Functor2 } from './Functor'
import { Applicative2 } from './Applicative'
/**
 * @category model
 * @since 2.3.0
 */
export interface ReaderTask<R, A> {
  (r: R): Task<A>
}
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const fromTask: <R, A>(ma: Task<A>) => ReaderTask<R, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const fromReader: <R, A = never>(ma: Reader<R, A>) => ReaderTask<R, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const fromIO: <R, A>(ma: IO<A>) => ReaderTask<R, A>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const ask: <R>() => ReaderTask<R, R>
/**
 * @category constructors
 * @since 2.3.0
 */
export declare const asks: <R, A = never>(f: (r: R) => A) => ReaderTask<R, A>
/**
 * @category combinators
 * @since 2.3.0
 */
export declare const local: <Q, R>(f: (f: Q) => R) => <A>(ma: ReaderTask<R, A>) => ReaderTask<Q, A>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare function fromIOK<A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => IO<B>
): <R>(...a: A) => ReaderTask<R, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare const chainIOK: <A, B>(f: (a: A) => IO<B>) => <R>(ma: ReaderTask<R, A>) => ReaderTask<R, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare function fromTaskK<A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Task<B>
): <R>(...a: A) => ReaderTask<R, B>
/**
 * @category combinators
 * @since 2.4.0
 */
export declare const chainTaskK: <A, B>(f: (a: A) => Task<B>) => <R>(ma: ReaderTask<R, A>) => ReaderTask<R, B>
/**
 * @category Functor
 * @since 2.3.0
 */
export declare const map: <A, B>(f: (a: A) => B) => <R>(fa: ReaderTask<R, A>) => ReaderTask<R, B>
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.3.0
 */
export declare const ap: <R, A>(fa: ReaderTask<R, A>) => <B>(fab: ReaderTask<R, (a: A) => B>) => ReaderTask<R, B>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.3.0
 */
export declare const apFirst: <R, B>(fb: ReaderTask<R, B>) => <A>(fa: ReaderTask<R, A>) => ReaderTask<R, A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.3.0
 */
export declare const apSecond: <R, B>(fb: ReaderTask<R, B>) => <A>(fa: ReaderTask<R, A>) => ReaderTask<R, B>
/**
 * @category Applicative
 * @since 2.3.0
 */
export declare const of: <R, A>(a: A) => ReaderTask<R, A>
/**
 * Less strict version of  [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.7
 */
export declare const chainW: <R, A, B>(
  f: (a: A) => ReaderTask<R, B>
) => <Q>(ma: ReaderTask<Q, A>) => ReaderTask<Q & R, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.3.0
 */
export declare const chain: <A, R, B>(f: (a: A) => ReaderTask<R, B>) => (ma: ReaderTask<R, A>) => ReaderTask<R, B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.3.0
 */
export declare const chainFirst: <A, R, B>(f: (a: A) => ReaderTask<R, B>) => (ma: ReaderTask<R, A>) => ReaderTask<R, A>
/**
 * @category Monad
 * @since 2.3.0
 */
export declare const flatten: <R, A>(mma: ReaderTask<R, ReaderTask<R, A>>) => ReaderTask<R, A>
/**
 * @category instances
 * @since 2.3.0
 */
export declare const URI = 'ReaderTask'
/**
 * @category instances
 * @since 2.3.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: ReaderTask<E, A>
  }
}
/**
 * @category instances
 * @since 2.3.0
 */
export declare function getSemigroup<R, A>(S: Semigroup<A>): Semigroup<ReaderTask<R, A>>
/**
 * @category instances
 * @since 2.3.0
 */
export declare function getMonoid<R, A>(M: Monoid<A>): Monoid<ReaderTask<R, A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ApplicativePar: Applicative2<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ApplicativeSeq: Applicative2<URI>
/**
 * @category instances
 * @since 2.3.0
 */
export declare const readerTask: MonadTask2<URI>
/**
 * Like `readerTask` but `ap` is sequential
 *
 * @category instances
 * @since 2.3.0
 */
export declare const readerTaskSeq: typeof readerTask
/**
 * @since 2.4.0
 */
export declare function run<R, A>(ma: ReaderTask<R, A>, r: R): Promise<A>
