import { L5Rel } from "./L5"

type ConjunctionNode = {
  type: "ConjunctionNode",
  left: L6Conjunction,
  right: L5Rel
}

export type L6Conjunction = ConjunctionNode | L5Rel