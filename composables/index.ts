import type { ZodIssue, ZodSchema, z } from 'zod'
import type { Paths, Split } from 'type-fest'
import { triggerRef, watch } from 'vue'
import { curry, get, set } from 'lodash-es'

// TODO It's just prototype
type Check<A, B> = [A] extends [B] ? unknown : never
type PathArray = (string | number)[]
type ToStringArray<T extends (string | number)[]> = {
  [P in keyof T]: `${T[P]}`;
}
type PathOrArray<TPathString, TPathStringArray, TPathArray extends PathArray> = TPathString | TPathArray & (TPathArray & Check<ToStringArray<TPathArray>, TPathStringArray>)

export const useValidation = <
  const TSchema extends ZodSchema,
  TPathString extends string = Exclude<Paths<z.infer<TSchema>>, never | number>,
  TPathStringArray = Split<TPathString, '.'>,
>(valueRef: Ref,
  schema: TSchema,
) => {
  let issues: ZodIssue[] = []

  const isInvalid = <const TPathArray extends PathArray>(pathOrArray: PathOrArray<TPathString, TPathStringArray, TPathArray>) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray : pathOrArray.join('.')
    return issues.some((issue) => {
      return issue.path.join('.').startsWith(path as string)
    })
  }

  const isValid = <const TPathArray extends PathArray>(pathOrArray: PathOrArray<TPathString, TPathStringArray, TPathArray>) => {
    return !isInvalid(pathOrArray)
  }

  const listErrors = <const TPathArray extends PathArray>(pathOrArray: PathOrArray<TPathString, TPathStringArray, TPathArray>) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray : pathOrArray.join('.')
    return issues.filter((issue) => {
      return issue.path.join('.').startsWith(path as string)
    })?.map(x => x.message).flat()
  }

  const oneError = <const TPathArray extends PathArray>(pathOrArray: PathOrArray<TPathString, TPathStringArray, TPathArray>) => {
    const errors = listErrors(pathOrArray)
    return errors.length ? errors[0] : null
  }

  const stateMap = new WeakMap()

  const checkState = <const TPathArray extends PathArray>(stateName: string, pathOrArray: PathOrArray<TPathString, TPathStringArray, TPathArray>) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray.split('.') : pathOrArray as string[]
    const targetValue = get(valueRef.value, path)
    if (typeof targetValue === 'object') {
      return false
    }
    const parentPath = path.slice(0, -1)
    const value = parentPath.length ? get(valueRef.value, parentPath) : valueRef.value
    const state = stateMap.get(value) ?? {}
    return get(state, [path.at(-1) || '', stateName]) || false
  }

  const isDirty = curry(checkState)('dirty')

  const isTouched = curry(checkState)('touched')

  const attrs = <const TPathArray extends PathArray>(pathOrArray: PathOrArray<TPathString, TPathStringArray, TPathArray>) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray.split('.') : pathOrArray
    const targetValue = get(valueRef.value, path)

    if (typeof targetValue === 'object') {
      return {} // TODO No attrs. Is it OK?
    }

    const parentPath = path.slice(0, -1)
    const value = parentPath.length ? get(valueRef.value, parentPath) : valueRef.value
    const state = stateMap.get(value) ?? {}
    if (!Object.keys(state).length) { stateMap.set(value, state) }

    return {
      onBlur: () => {
        set(state, [path.at(-1) || '', 'touched'], true)
        triggerRef(valueRef)
      },
      onInput: () => {
        set(state, [path.at(-1) || '', 'dirty'], true)
        triggerRef(valueRef)
      },
    }
  }

  watch(valueRef, (value) => {
    const result = schema.safeParse(value)
    if (result.success) {
      issues = []
    } else {
      issues = result.error.issues
    }
  }, { deep: true })

  return {
    isValid,
    isInvalid,
    listErrors,
    oneError,
    attrs,
    isTouched,
    isDirty,
  }
}
