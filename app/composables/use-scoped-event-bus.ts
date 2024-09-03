import type { ComponentOptionsMixin, EmitsOptions } from 'vue'

type EmittableComopnent = Component & { emits?: EmitsOptions | ThisType<void> }

type DefinedEmits<TComponent extends EmittableComopnent> = Omit<Exclude<TComponent['emits'], undefined | string[]>, keyof ThisType<void>>

type EventName<TComponent extends EmittableComopnent> = keyof DefinedEmits<TComponent>

type EventListener<TComponent extends EmittableComopnent, TEvent extends EventName<TComponent>> = DefinedEmits<TComponent>[TEvent]

type Operation = {
  component: EmittableComopnent
  event: EventName<EmittableComopnent>
  listner: EventListener<EmittableComopnent, EventName<EmittableComopnent>>
}

const HELPER_NAME = '$scopedEventBus'

export const useScopedEventBus = () => {
  const operations = [] as Operation[]

  const doProvide = () => {
    provide(HELPER_NAME, {
      dispatch: (componentName: string, event: string, ...args: any[]) => {
        const c = operations.find((op) => {
          return (componentName === (op.component.name || (op.component as any).__name)) && event === op.event
        })!
        c?.listner(...args)
      },
    })
  }
  doProvide()

  const provideEventBus = (c: ComponentOptionsMixin): ComponentOptionsMixin => ({
    ...c,
    setup(props, ctx) {
      doProvide()
      return c.setup?.(props, ctx)
    },
  })

  const defineEventDispatcher = <
    TComponent extends EmittableComopnent,
    TEvent extends EventName<TComponent>,
    TListener extends EventListener<TComponent, TEvent>,
  >(component: TComponent,
    componentOps: Record<TEvent, TListener>,
  ) => {
    Object.entries(componentOps).forEach(([event, listner]) => {
      operations.push({ component, event, listner })
    })
  }

  return {
    provideEventBus,
    defineEventDispatcher,
  }
}

export const useScopedEmit = () => {
  const i = getCurrentInstance()
  const $scopedEventBus = inject(HELPER_NAME, null)
  const emit = $scopedEventBus
    ? async (event: string, ...args: any[]) => {
      i?.emit(event, args)
      // @ts-expect-error Fix type error
      await $scopedEventBus.dispatch(i?.type.__name, event, ...args)
    }
    : i?.emit

  if (!emit) {
    throw new Error('emit not defined')
  }

  return {
    emit,
  }
}
