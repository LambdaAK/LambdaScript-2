import { L7Disjunction } from "./L7"

type ConsNode = {
  type: "ConsNode",
  left: L7Disjunction,
  right: L8Cons
}

export type L8Cons = ConsNode | L7Disjunction