import { RelationalOperatorType } from "../../lexer/token"
import { Maybe } from "../../util/maybe"
import { DefnAST } from "../defn/defn"
import { Pat } from "../pat/Pat"
import { Type } from "../type/Type"

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

