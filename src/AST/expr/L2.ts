import { L1Factor } from "./L1"

type AppNode = {
  type: 'ApplicationNode',
  left: L2App,
  right: L1Factor
}

export type L2App = AppNode | L1Factor