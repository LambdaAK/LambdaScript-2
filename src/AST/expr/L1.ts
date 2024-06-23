import { L9Expr } from "./L9"

type StringNode = {
  type: 'StringNode',
  value: string
}

type NumberNode = {
  type: "NumberNode",
  value: number
}

type BooleanNode = {
  type: "BooleanNode",
  value: boolean
}

type IdentifierNode = {
  type: "IdentifierNode",
  value: string
}

type ParenFactorNode = {
  type: 'ParenFactorNode',
  node: L9Expr
}

type NilNode = {
  type: 'NilNode'
}

type UnitNode = {
  type: 'UnitNode'
}

export type L1Factor =
  | StringNode
  | NumberNode
  | BooleanNode
  | IdentifierNode
  | NilNode
  | UnitNode
  | ParenFactorNode