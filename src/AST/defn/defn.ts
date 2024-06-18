import { Maybe } from "../../util/maybe"
import { Expr } from "../expr/expr"
import { Pat } from "../pat/Pat"
import { Type } from "../type/Type"
import { DefnType } from "./defnL1"

export type DefnAST = {
  type: "DefnAST",
  pat: Pat,
  body: Expr,
  typeAnnotation: Maybe<Type>,
  defnType: DefnType
}