import { DefnAST } from "../AST/defn/defn"
import { Expr } from "../AST/expr/expr"
import { Pat } from "../AST/pat/Pat"
import { Type } from "../AST/type/Type"

const compilePattern = (pattern: Pat): string => {
  throw new Error('Not implemented')
}

const compileType = (type: Type): string => {
  throw new Error('Not implemented')
}

const compileExpr = (expr: Expr): string => {
  throw new Error('Not implemented')
}


const compileDefn = (defn: DefnAST): string => {
  throw new Error('Not implemented')
}

export const compile = (defns: DefnAST[]): string => {
  throw new Error('Not implemented')
}