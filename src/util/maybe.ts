export type None = {
  type: 'None'
}
export type Some<T> = {
  type: 'Some'
  value: T
}

export type Maybe<T> = Some<T> | None

export const some = <T>(v: T): Maybe<T> => {
  return {
    type: 'Some',
    value: v
  }
}

export const none = (): None => { return { type: 'None' } }

export const isNone = <T>(m: Maybe<T>): m is None => {
  return m.type === 'None'
}

export const isSome = <T>(m: Maybe<T>): m is Some<T> => {
  return m.type === 'Some'
}