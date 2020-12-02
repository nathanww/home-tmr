/**
 * ```ts
 * interface IO<A> {
 *   (): A
 * }
 * ```
 *
 * `IO<A>` represents a non-deterministic synchronous computation that can cause side effects, yields a value of
 * type `A` and **never fails**. If you want to represent a synchronous computation that may fail, please see
 * `IOEither`.
 *
 * @since 2.0.0
 */
import { Applicative1 } from './Applicative'
import { ChainRec1 } from './ChainRec'
import { Functor1 } from './Functor'
import { Monad1 } from './Monad'
import { MonadIO1 } from './MonadIO'
import { Monoid } from './Monoid'
import { Semigroup } from './Semigroup'
/**
 * @category model
 * @since 2.0.0
 */
export interface IO<A> {
  (): A
}
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
export declare const map: <A, B>(f: (a: A) => B) => (fa: IO<A>) => IO<B>
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const ap: <A>(fa: IO<A>) => <B>(fab: IO<(a: A) => B>) => IO<B>
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apFirst: <B>(fb: IO<B>) => <A>(fa: IO<A>) => IO<A>
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export declare const apSecond: <B>(fb: IO<B>) => <A>(fa: IO<A>) => IO<B>
/**
 * @category Applicative
 * @since 2.0.0
 */
export declare const of: <A>(a: A) => IO<A>
/**
 * @category Monad
 * @since 2.0.0
 */
export declare const chain: <A, B>(f: (a: A) => IO<B>) => (ma: IO<A>) => IO<B>
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export declare const chainFirst: <A, B>(f: (a: A) => IO<B>) => (ma: IO<A>) => IO<A>
/**
 * @category Monad
 * @since 2.0.0
 */
export declare const flatten: <A>(mma: IO<IO<A>>) => IO<A>
/**
 * @category MonadIO
 * @since 2.7.0
 */
export declare const fromIO: MonadIO1<URI>['fromIO']
/**
 * @category instances
 * @since 2.0.0
 */
export declare const URI = 'IO'
/**
 * @category instances
 * @since 2.0.0
 */
export declare type URI = typeof URI
declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: IO<A>
  }
}
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getSemigroup<A>(S: Semigroup<A>): Semigroup<IO<A>>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getMonoid<A>(M: Monoid<A>): Monoid<IO<A>>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Functor: Functor1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Applicative: Applicative1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const Monad: Monad1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const MonadIO: MonadIO1<URI>
/**
 * @category instances
 * @since 2.7.0
 */
export declare const ChainRec: ChainRec1<URI>
/**
 * @category instances
 * @since 2.0.0
 */
export declare const io: Monad1<URI> & MonadIO1<URI> & ChainRec1<URI>
