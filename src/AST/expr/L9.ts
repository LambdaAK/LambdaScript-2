import { PatL2 } from "../pat/PatL2"
import { L8Cons } from "./L8"

type FunctionNode = {
  type: "FunctionNode",
  pattern: PatL2,
  body: L9Expr
}

export type L9Expr = FunctionNode | L8Cons