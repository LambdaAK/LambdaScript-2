import { L6Conjunction } from "./L6"

type DisjunctionNode = {
  type: "DisjunctionNode",
  left: L7Disjunction,
  right: L6Conjunction
}

export type L7Disjunction = DisjunctionNode | L6Conjunction