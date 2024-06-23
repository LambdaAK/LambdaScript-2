import { RelationalOperatorType } from "../../lexer/token"
import { Maybe } from "../../util/maybe"
import { DefnAST, stringOfDefn } from "../defn/defn"
import { Pat, stringOfPat } from "../pat/Pat"
import { stringOfType, Type } from "../type/Type"

type StringAST = {
  type: 'StringAST',
  value: string
}

type NumberAST = {
  type: "NumberAST",
  value: number
}

type BooleanAST = {
  type: "BooleanAST",
  value: boolean
}

type IdentifierAST = {
  type: "IdentifierAST",
  value: string
}

type NilAST = {
  type: 'NilAST'
}

type UnitAST = {
  type: "UnitAST"
}

type AppAST = {
  type: 'ApplicationAST',
  left: Expr,
  right: Expr
}

type TimesAST = {
  type: 'TimesAST',
  left: Expr,
  right: Expr
}

type DivideAST = {
  type: 'DivideAST',
  left: Expr,
  right: Expr
}

type PlusAST = {
  type: 'PlusAST',
  left: Expr,
  right: Expr
}

type MinusAST = {
  type: 'MinusAST',
  left: Expr,
  right: Expr
}

type RelAST = {
  type: 'RelAST',
  left: Expr,
  right: Expr,
  operator: RelationalOperatorType
}

type ConjunctionAST = {
  type: "ConjunctionAST",
  left: Expr,
  right: Expr
}

type DisjunctionAST = {
  type: "DisjunctionAST",
  left: Expr,
  right: Expr
}

type ConsAST = {
  type: 'ConsAST',
  left: Expr,
  right: Expr
}

type FunctionAST = {
  type: "FunctionAST",
  pattern: Pat,
  body: Expr,
  typeAnnotation: Maybe<Type>
}

type IfAST = {
  type: "IfAST",
  condition: Expr,
  thenBranch: Expr,
  elseBranch: Expr
}

type BlockAST = {
  type: "BlockAST",
  statements: (Expr | DefnAST)[]
}

export type Expr = StringAST
  | NumberAST
  | BooleanAST
  | IdentifierAST
  | NilAST
  | UnitAST
  | AppAST
  | TimesAST
  | DivideAST
  | PlusAST
  | MinusAST
  | RelAST
  | ConjunctionAST
  | DisjunctionAST
  | ConsAST
  | FunctionAST
  | IfAST
  | BlockAST

export const stringOfExpr = (expr: Expr): string => {
  switch (expr.type) {
    case 'StringAST':
      return expr.value
    case 'NumberAST':
      return expr.value.toString()
    case 'BooleanAST':
      return expr.value.toString()
    case 'IdentifierAST':
      return expr.value
    case 'NilAST':
      return '[]'
    case 'UnitAST':
      return '()'
    case 'ApplicationAST':
      return `(${stringOfExpr(expr.left)} ${stringOfExpr(expr.right)})`
    case 'TimesAST':
      return `(${stringOfExpr(expr.left)} * ${stringOfExpr(expr.right)})`
    case 'DivideAST':
      return `(${stringOfExpr(expr.left)} / ${stringOfExpr(expr.right)})`
    case 'PlusAST':
      return `(${stringOfExpr(expr.left)} + ${stringOfExpr(expr.right)})`
    case 'MinusAST':
      return `(${stringOfExpr(expr.left)} - ${stringOfExpr(expr.right)})`
    case 'RelAST':
      return `(${stringOfExpr(expr.left)} ${expr.operator} ${stringOfExpr(expr.right)})`
    case 'ConjunctionAST':
      return `(${stringOfExpr(expr.left)} && ${stringOfExpr(expr.right)})`
    case 'DisjunctionAST':
      return `(${stringOfExpr(expr.left)} || ${stringOfExpr(expr.right)})`
    case 'ConsAST':
      return `(${stringOfExpr(expr.left)} :: ${stringOfExpr(expr.right)})`
    case 'FunctionAST':
      // fn (x : t) -> e
      const pattern = stringOfPat(expr.pattern)
      const body = stringOfExpr(expr.body)
      const typeAnnotation = expr.typeAnnotation.type === 'None' ? '' : ` : ${stringOfType(expr.typeAnnotation.value)}`
      if (typeAnnotation.length > 0) return `fn (${pattern}${typeAnnotation}) -> ${body}`
      else return `fn ${pattern} -> ${body}`
    case 'IfAST':
      return `if ${stringOfExpr(expr.condition)} then ${stringOfExpr(expr.thenBranch)} else ${stringOfExpr(expr.elseBranch)}`
    case 'BlockAST':
      return `{\n${expr.statements.map((stmt) => {
        if (stmt.type === 'DefnAST') {
          return stringOfDefn(stmt)
        } else {
          return stringOfExpr(stmt)
        }
      }).join('\n')}\n}`
  }
}
