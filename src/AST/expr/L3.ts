import { L2App } from "./L2"

type TimesNode = {
  type: 'TimesNode',
  left: L3Term,
  right: L2App
}

type DivideNode = {
  type: 'DivideNode',
  left: L3Term,
  right: L2App
}

export type L3Term =
  | L2App
  | TimesNode
  | DivideNode