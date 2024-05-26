export type None = {
  type: 'None'
}
export type Some<T> = {
  type: 'Some'
  value: T
}

export type Maybe<T> = Some<T> | None

export const some = <T>(v: T) => {
  return {
    value: v
  }
}

export const none = () => { return {} }