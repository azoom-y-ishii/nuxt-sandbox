import type { EmitsOptions } from 'vue'

type EmittableComopnent = Component & { emits?: EmitsOptions | ThisType<void> }

type DefinedEmits<TComponent extends EmittableComopnent> = Omit<Exclude<TComponent['emits'], undefined | string[]>, keyof ThisType<void>>

type EventName<TComponent extends EmittableComopnent> = keyof DefinedEmits<TComponent>

type EventListener<TComponent extends EmittableComopnent, TEvent extends EventName<TComponent>> = DefinedEmits<TComponent>[TEvent]

type Operation = {
  component: EmittableComopnent
  event: EventName<EmittableComopnent>
  listner: EventListener<EmittableComopnent, EventName<EmittableComopnent>>
}

const HELPER_NAME = '$orchestrator'

export const useOrchestrator = () => {
  const operations = [] as Operation[]
  provide(HELPER_NAME, {
    operate: (componentName: string, event: string, ...args: any[]) => {
      const c = operations.find((op) => {
        return (componentName === (op.component.name || (op.component as any).__name)) && event === op.event
      })!
      c?.listner(...args)
    },
  })

  const defineOperation = <
    TComponent extends EmittableComopnent,
    TEvent extends EventName<TComponent>,
    TListener extends EventListener<TComponent, TEvent>,
  >(component: TComponent,
    event: TEvent,
    listner: TListener,
  ) => {
    operations.push({ component, event, listner })
    return { component, event, listner }
  }

  return {
    defineOperation,
  }
}

export const useOperator = <T>(emit: T) => {
  const i = getCurrentInstance()
  const $orchestrator = inject(HELPER_NAME, null)
  const $operate = $orchestrator
    ? (event: string, ...args: any[]) => {
        // @ts-expect-error Fix type error
        emit(event, args)
        // @ts-expect-error Fix type error
        $orchestrator.operate(i?.type.__name, event, ...args)
      }
    : emit

  return {
    $operate,
  }
}
