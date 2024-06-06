import { RelationalOperatorType } from "../../lexer/token"
import { Pat } from "../pat/Pat"

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
  body: Expr
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

