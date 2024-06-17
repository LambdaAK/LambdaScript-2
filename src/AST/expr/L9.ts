import { Maybe } from "../../util/maybe"
import { PatL2 } from "../pat/PatL2"
import { L8Cons } from "./L8"

type FunctionNode = {
  type: "FunctionNode",
  pattern: PatL2,
  body: L9Expr,
  typeAnnotation: Maybe<TypeL4>
}

type IfNode = {
  type : "IfNode",
  condition: L9Expr,
  thenBranch: L9Expr,
  elseBranch: L9Expr
}

export type L9Expr = FunctionNode | IfNode | L8Cons