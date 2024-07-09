import type { ZodIssue, ZodSchema, z } from 'zod'
import type { Paths, Split } from 'type-fest'
import { triggerRef, watch } from 'vue'
import { get, set } from 'lodash-es'

// TODO It's just prototype. many refactorings are necessary
type Check<A, B> = [A] extends [B] ? unknown : never
type PathArray = (string | number)[]
type ToStringArray<T extends (string | number)[]> = {
  [P in keyof T]: `${T[P]}`;
}
type PathOrArray<
  TSchema extends ZodSchema,
  TPathArray extends PathArray,
  TPathString extends string = Exclude<Paths<z.infer<TSchema>>, number>,
  TPathStringArray = Split<TPathString, '.'>,
> = TPathString | TPathArray & (Check<ToStringArray<TPathArray>, TPathStringArray>)

type ValidationOptions = {
  mode: 'lazy' // Currently only support lazy. 'aggressive' | 'passive' | 'lazy' | 'eager like vee validate
}

// ,
//   TPathString extends string = Exclude<Paths<z.infer<TSchema>>, number>,
//   ,

export const useValidation = <
  const TSchema extends ZodSchema,
>(
  valueRef: Ref,
  schema: TSchema,
  opts: ValidationOptions = { mode: 'lazy' },
) => {
  let issues: ZodIssue[] = []

  const isInvalid = <const TPathArray extends PathArray>(pathOrArray?: PathOrArray<TSchema, TPathArray>) => {
    const path = pathOrArray
      ? (typeof pathOrArray === 'string' ? pathOrArray : pathOrArray.join('.'))
      : undefined

    // TOOD more simplify
    if (opts.mode === 'lazy' && !isTouched(path as PathOrArray<TSchema, TPathArray>)) { return false }

    if (!path) {
      return Boolean(issues.length)
    }

    return issues.some((issue) => {
      const issuePath = issue.path.join('.')
      return issuePath === path || issuePath.startsWith(`${path}.`)
    })
  }

  const isValid = <const TPathArray extends PathArray>(pathOrArray?: PathOrArray<TSchema, TPathArray>) => {
    return !isInvalid(pathOrArray)
  }

  const listErrors = <const TPathArray extends PathArray>(pathOrArray: PathOrArray<TSchema, TPathArray>) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray : pathOrArray.join('.')

    // TOOD more simplify
    if (opts.mode === 'lazy' && !isTouched(path as PathOrArray<TSchema, TPathArray>)) { return [] }

    return issues.filter((issue) => {
      const issuePath = issue.path.join('.')
      return issuePath === path || issuePath.startsWith(`${path}.`)
    })?.map(x => x.message).flat()
  }

  const oneError = <const TPathArray extends PathArray>(...pathOrArrays: PathOrArray<TSchema, TPathArray>[]) => {
    const errors = pathOrArrays.map(listErrors).flat()
    return errors.length ? errors[0] : null
  }

  const stateMap = new WeakMap()

  const checkState = <const TPathArray extends PathArray>(stateName: string, pathOrArray?: PathOrArray<TSchema, TPathArray>) => {
    const path = pathOrArray
      ? (typeof pathOrArray === 'string' ? pathOrArray.split('.') : pathOrArray as string[])
      : undefined
    const state = getState(path)
    return get(state, [path?.at(-1) || '', stateName]) || false
  }

  const isDirty = <const TPathArray extends PathArray>(path?: Parameters<typeof checkState<TPathArray>>[1]) => checkState('dirty', path)

  const isTouched = <const TPathArray extends PathArray>(path?: Parameters<typeof checkState<TPathArray>>[1]) => checkState('touched', path)

  const getState = (path?: string[]) => {
    let value = getProp(valueRef.value, path)
    let state
    if (typeof value === 'object') {
      state = stateMap.get(value) ?? {}
    } else {
      if (!path) { throw new Error('path must be object') }
      const parentPath = path.slice(0, -1)
      value = parentPath.length ? get(valueRef.value, parentPath) : valueRef.value
      state = stateMap.get(value) ?? {}
    }
    if (!Object.keys(state).length) { stateMap.set(value, state) }
    return state
  }

  type AttrsOptions = {
    primitive?: boolean
  }

  const attrs = <const TPathArray extends PathArray>(
    pathOrArray: PathOrArray<TSchema, TPathArray>,
    options: AttrsOptions = { primitive: false },
  ) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray.split('.') : pathOrArray
    const value = getProp(valueRef.value, path as string[])

    const state = getState(path as string[])

    const valueAttrName = options.primitive ? 'value' : 'modelValue'
    const updateAttrName = options.primitive ? 'onInput' : 'onUpdate:modelValue'

    return {
      onBlur: () => {
        set(state, [path.at(-1) || '', 'touched'], true)
        triggerRef(valueRef)
      },
      [updateAttrName]: (eventOrData: any) => {
        set(valueRef.value, path as string[], options.primitive ? eventOrData.target.value : eventOrData)
        set(state, [path.at(-1) || '', 'dirty'], true)
      },
      invalid: isInvalid(pathOrArray),
      [valueAttrName]: value,
    }
  }

  const touch = <const TPathArray extends PathArray>(pathOrArray?: PathOrArray<TSchema, TPathArray>) => {
    const path = pathOrArray
      ? (typeof pathOrArray === 'string' ? pathOrArray.split('.') : pathOrArray) as string[]
      : undefined
    const value = getProp(valueRef.value, path)
    traverseObjectDeep(value, (_, path) => {
      const state = getState(path)
      set(state, [path.at(-1) || '', 'touched'], true)
    })

    // eslint-disable-next-line no-console
    console.log(issues)
    triggerRef(valueRef)
  }
  watch(valueRef, (value) => {
    const result = schema.safeParse(value)
    if (result.success) {
      issues = []
    } else {
      issues = result.error.issues
    }
  }, { deep: true, immediate: true })

  return {
    isValid,
    isInvalid,
    listErrors,
    oneError,
    attrs,
    touch,
    isTouched,
    isDirty,
  }
}

const getProp = (obj: any, path: string | string[] | undefined, defaultValue?: any) => {
  if (!path || !path.length) { return obj }
  return get(obj, path, defaultValue)
}

const traverseObjectDeep = (obj: any, cb: (value: any, path: string[], isObject: boolean) => void, path: string[] = []) => {
  if (typeof obj === 'object') {
    cb(obj, path, true)
  } else {
    cb(obj, path, false)
    return
  }
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'object') {
      cb(value, [...path, key], true)
      traverseObjectDeep(value, cb, [...path, key])
    } else {
      cb(value, [...path, key], false)
    }
  }
}
