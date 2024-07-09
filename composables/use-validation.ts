import type { ZodIssue, ZodSchema, z } from 'zod'
import type { Paths, Split } from 'type-fest'
import { triggerRef, watch } from 'vue'
import { get, set } from 'lodash-es'

// TODO It's just prototype. many refactorings are necessary
type Same<A, B> = [A] extends [B] ? unknown : never
type Path = (string | number)[]
type ToStringArray<T extends (string | number)[]> = {
  [P in keyof T]: `${T[P]}`;
}
type PathOrArray<
  TSchema extends ZodSchema,
  TPath extends Path,
  TPathString extends string = Exclude<Paths<z.infer<TSchema>>, number>,
  TPathStringArray = Split<TPathString, '.'>,
> = TPathString | TPath & (Same<ToStringArray<TPath>, TPathStringArray>)

type ValidationOptions = {
  mode: 'lazy' // Currently only support lazy. 'aggressive' | 'passive' | 'lazy' | 'eager like vee validate
}

export const useValidation = <const TSchema extends ZodSchema>(
  valueRef: Ref,
  schema: TSchema,
  opts: ValidationOptions = { mode: 'lazy' },
) => {
  let issues: ZodIssue[] = []

  const isInvalid = <const TPath extends Path>(pathOrArray?: PathOrArray<TSchema, TPath>) => {
    const path = pathOrArray
      ? (typeof pathOrArray === 'string' ? pathOrArray : pathOrArray.join('.'))
      : undefined

    // TOOD more simplify
    if (opts.mode === 'lazy' && !isTouched(path as PathOrArray<TSchema, TPath>)) { return false }

    if (!path) {
      return Boolean(issues.length)
    }

    return issues.some((issue) => {
      const issuePath = issue.path.join('.')
      return issuePath === path || issuePath.startsWith(`${path}.`)
    })
  }

  const isValid = <const TPath extends Path>(pathOrArray?: PathOrArray<TSchema, TPath>) => {
    return !isInvalid(pathOrArray)
  }

  const listErrors = <const TPath extends Path>(pathOrArray: PathOrArray<TSchema, TPath>) => {
    const path = typeof pathOrArray === 'string' ? pathOrArray : pathOrArray.join('.')

    // TOOD more simplify
    if (opts.mode === 'lazy' && !isTouched(path as PathOrArray<TSchema, TPath>)) { return [] }

    return issues.filter((issue) => {
      const issuePath = issue.path.join('.')
      return issuePath === path || issuePath.startsWith(`${path}.`)
    })?.map(x => x.message).flat()
  }

  const oneError = <const TPath extends Path>(...pathOrArrays: PathOrArray<TSchema, TPath>[]) => {
    const errors = pathOrArrays.map(listErrors).flat()
    return errors.length ? errors[0] : null
  }

  const stateMap = new WeakMap()

  const checkState = <const TPath extends Path>(stateName: string, pathOrArray?: PathOrArray<TSchema, TPath>) => {
    const path = pathOrArray
      ? (typeof pathOrArray === 'string' ? pathOrArray.split('.') : pathOrArray as string[])
      : undefined
    const state = getState(path)
    return get(state, [path?.at(-1) || '', stateName]) || false
  }

  const isDirty = <const TPath extends Path>(path?: Parameters<typeof checkState<TPath>>[1]) => checkState('dirty', path)

  const isTouched = <const TPath extends Path>(path?: Parameters<typeof checkState<TPath>>[1]) => checkState('touched', path)

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

  const attrs = <const TPath extends Path>(
    pathOrArray: PathOrArray<TSchema, TPath>,
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

  const touch = <const TPath extends Path>(pathOrArray?: PathOrArray<TSchema, TPath>) => {
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
