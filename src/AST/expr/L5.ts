import { RelationalOperatorType } from "../../lexer/token"
import { L4Arith } from "./L4"

type RelNode = {
  type: "RelNode",
  left: L5Rel,
  right: L4Arith,
  operator: RelationalOperatorType
}

export type L5Rel =
  | RelNode
  | L4Arith