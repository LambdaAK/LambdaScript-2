import { Maybe } from "../../util/maybe"
import { Expr } from "../expr/expr"
import { Pat, stringOfPat } from "../pat/Pat"
import { Type } from "../type/Type"
import { DefnType } from "./defnL1"
import { stringOfExpr } from "../expr/expr"
import { stringOfType } from "../type/Type"

export type DefnAST = {
  type: "DefnAST",
  pat: Pat,
  body: Expr,
  typeAnnotation: Maybe<Type>,
  defnType: DefnType
}

export const stringOfDefn = (defn: DefnAST): string => {
  const pat = stringOfPat(defn.pat)
  const body = stringOfExpr(defn.body)
  const typeAnnotation = defn.typeAnnotation.type === 'None' ? '' : ` : ${stringOfType(defn.typeAnnotation.value)}`
  return `val ${pat}${typeAnnotation} = ${body}`
}