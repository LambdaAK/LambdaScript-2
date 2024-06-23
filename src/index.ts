import { isNone, Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { exprParser } from "./parser/expr/L9"
import { defnParser } from "./parser/defn/defnParser"
import { condenseDefn } from "./AST/defn/condenseDefn"
import { condenseExpr } from "./AST/expr/condenseExpr"
import { generate, unify, getType, objectsEqual, fixType, abstractify, typeOfExpr, generalizeTypeVars } from "./typecheck/typecheck"
import { ImmMap } from "./util/ImmMap"
import { Expr, stringOfExpr } from "./AST/expr/expr"
import { stringOfType } from "./AST/type/Type"

export const lexAndParseExpr = (s: string): Expr => {
  const tokens = lex(s)
  const nodeMaybe = exprParser(tokens)
  if (isNone(nodeMaybe)) {
    throw new Error(`Failed to parse expression1: ${s}`)
  }
  // condense the AST
  return condenseExpr(nodeMaybe.value[0])
}
