import { Magma } from './Magma'
import { Ord } from './Ord'
import { ReadonlyRecord } from './ReadonlyRecord'
/**
 * @category type classes
 * @since 2.0.0
 */
export interface Semigroup<A> extends Magma<A> {}
/**
 * @example
 * import * as S from 'fp-ts/lib/Semigroup'
 *
 * const sum = S.fold(S.semigroupSum)(0)
 *
 * assert.deepStrictEqual(sum([1, 2, 3]), 6)
 *
 * @since 2.0.0
 */
export declare function fold<A>(
  S: Semigroup<A>
): {
  (a: A): (as: ReadonlyArray<A>) => A
  (a: A, as: ReadonlyArray<A>): A
}
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getFirstSemigroup<A = never>(): Semigroup<A>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getLastSemigroup<A = never>(): Semigroup<A>
/**
 * Given a tuple of semigroups returns a semigroup for the tuple
 *
 * @example
 * import { getTupleSemigroup, semigroupString, semigroupSum, semigroupAll } from 'fp-ts/lib/Semigroup'
 *
 * const S1 = getTupleSemigroup(semigroupString, semigroupSum)
 * assert.deepStrictEqual(S1.concat(['a', 1], ['b', 2]), ['ab', 3])
 *
 * const S2 = getTupleSemigroup(semigroupString, semigroupSum, semigroupAll)
 * assert.deepStrictEqual(S2.concat(['a', 1, true], ['b', 2, false]), ['ab', 3, false])
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getTupleSemigroup<T extends ReadonlyArray<Semigroup<any>>>(
  ...semigroups: T
): Semigroup<
  {
    [K in keyof T]: T[K] extends Semigroup<infer A> ? A : never
  }
>
/**
 * The dual of a `Semigroup`, obtained by swapping the arguments of `concat`.
 *
 * @example
 * import { getDualSemigroup, semigroupString } from 'fp-ts/lib/Semigroup'
 *
 * assert.deepStrictEqual(getDualSemigroup(semigroupString).concat('a', 'b'), 'ba')
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getDualSemigroup<A>(S: Semigroup<A>): Semigroup<A>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getFunctionSemigroup<S>(S: Semigroup<S>): <A = never>() => Semigroup<(a: A) => S>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getStructSemigroup<O extends ReadonlyRecord<string, any>>(
  semigroups: {
    [K in keyof O]: Semigroup<O[K]>
  }
): Semigroup<O>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getMeetSemigroup<A>(O: Ord<A>): Semigroup<A>
/**
 * @category instances
 * @since 2.0.0
 */
export declare function getJoinSemigroup<A>(O: Ord<A>): Semigroup<A>
/**
 * Returns a `Semigroup` instance for objects preserving their type
 *
 * @example
 * import { getObjectSemigroup } from 'fp-ts/lib/Semigroup'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * const S = getObjectSemigroup<Person>()
 * assert.deepStrictEqual(S.concat({ name: 'name', age: 23 }, { name: 'name', age: 24 }), { name: 'name', age: 24 })
 *
 * @category instances
 * @since 2.0.0
 */
export declare function getObjectSemigroup<A extends object = never>(): Semigroup<A>
/**
 * Boolean semigroup under conjunction
 *
 * @category instances
 * @since 2.0.0
 */
export declare const semigroupAll: Semigroup<boolean>
/**
 * Boolean semigroup under disjunction
 *
 * @category instances
 * @since 2.0.0
 */
export declare const semigroupAny: Semigroup<boolean>
/**
 * Number `Semigroup` under addition
 *
 * @category instances
 * @since 2.0.0
 */
export declare const semigroupSum: Semigroup<number>
/**
 * Number `Semigroup` under multiplication
 *
 * @category instances
 * @since 2.0.0
 */
export declare const semigroupProduct: Semigroup<number>
/**
 * @category instances
 * @since 2.0.0
 */
export declare const semigroupString: Semigroup<string>
/**
 * @category instances
 * @since 2.0.0
 */
export declare const semigroupVoid: Semigroup<void>
/**
 * You can glue items between and stay associative
 *
 * @example
 * import { getIntercalateSemigroup, semigroupString } from 'fp-ts/lib/Semigroup'
 *
 * const S = getIntercalateSemigroup(' ')(semigroupString)
 *
 * assert.strictEqual(S.concat('a', 'b'), 'a b')
 * assert.strictEqual(S.concat(S.concat('a', 'b'), 'c'), S.concat('a', S.concat('b', 'c')))
 *
 * @category instances
 * @since 2.5.0
 */
export declare function getIntercalateSemigroup<A>(a: A): (S: Semigroup<A>) => Semigroup<A>
