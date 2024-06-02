import { RelationalOperatorType } from "./token"

/*
(** pat represents a pattern *)
type pat =
  | ConsPat of sub_pat * pat
  | SubPat of sub_pat
  | AppPat of sub_pat * sub_pat
(* the left sub_pat is (what should be ) a constructor the right sub_pat is the
   argument of the constructor *)

and sub_pat =
  | IdPat of string
  | UnitPat
  | VectorPat of pat list
  | WildcardPat
  | IntPat of int
  | StringPat of string
  | BoolPat of bool
  | NilPat
  | ConstructorPat of string
  | Pat of pat
  | InfixPat of string
*/

type NilPat = {
  type: 'NilPat'
}

type BoolPat = {
  type: 'BoolPat',
  value: boolean
}

type StringPat = {
  type: 'StringPat',
  value: string
}

type IntPat = {
  type: 'IntPat',
  value: number
}

type WildcardPat = {
  type: 'WildcardPat'
}

type UnitPat = {
  type: 'UnitPat'
}

type IdPat = {
  type: 'IdPat',
  value: string
}

type ConsPat = {
  type: 'ConsPat',
  left: PatL1,
  right: PatL2
}

type ParenPat = {
  type: 'ParenPat',
  node: PatL2
}

export type PatL1 = NilPat | BoolPat | StringPat | IntPat | WildcardPat | UnitPat | IdPat | ParenPat
export type PatL2 = PatL1 | ConsPat

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
  node: DisjunctionLevel
}

type NilNode = {
  type: 'NilNode'
}

type FactorLevel =
  | StringNode
  | NumberNode
  | BooleanNode
  | IdentifierNode
  | NilNode
  | ParenFactorNode

/**
 * Represents a function appliation `f x`
 */
type AppNode = {
  type: 'ApplicationNode',
  left: AppLevel,
  right: FactorLevel
}

type AppLevel = AppNode | FactorLevel

type TimesNode = {
  type: 'TimesNode',
  left: TermLevel,
  right: AppLevel
}

type DivideNode = {
  type: 'DivideNode',
  left: TermLevel,
  right: AppLevel
}

type TermLevel =
  | AppLevel
  | TimesNode
  | DivideNode

type PlusNode = {
  type: 'PlusNode',
  left: ArithLevel,
  right: TermLevel
}

type MinusNode = {
  type: 'MinusNode',
  left: ArithLevel,
  right: TermLevel
}

type ArithLevel =
  | TermLevel
  | PlusNode
  | MinusNode

type RelLevel =
  | RelNode
  | ArithLevel

type RelNode = {
  type: "RelNode",
  left: RelLevel,
  right: ArithLevel,
  operator: RelationalOperatorType
}

type ConjunctionNode = {
  type: "ConjunctionNode",
  left: ConjunctionLevel,
  right: RelLevel
}

type ConjunctionLevel = ConjunctionNode | RelLevel

type DisjunctionNode = {
  type: "DisjunctionNode",
  left: DisjunctionLevel,
  right: ConjunctionLevel
}

type DisjunctionLevel = DisjunctionNode | ConjunctionLevel

type ConsNode = {
  type: "ConsNode",
  left: DisjunctionLevel,
  right: ConsLevel
}

type ConsLevel = ConsNode | DisjunctionLevel

type FunctionNode = {
  type: "FunctionNode",
  pattern: PatL2,
  body: ExprLevel
}

type ExprLevel = FunctionNode | ConsLevel

// string of node
// put parenthesis to make the order of operations clear
const stringOfNode = (node: ConsLevel): string => {
  switch (node.type) {
    case 'MinusNode':
      return `(${stringOfNode(node.left)} - ${stringOfNode(node.right)})`
    case 'PlusNode':
      return `(${stringOfNode(node.left)} + ${stringOfNode(node.right)})`
    case 'TimesNode':
      return `(${stringOfNode(node.left)} * ${stringOfNode(node.right)})`
    case 'DivideNode':
      return `(${stringOfNode(node.left)} / ${stringOfNode(node.right)})`
    case 'ApplicationNode':
      return `${stringOfNode(node.left)} ${stringOfNode(node.right)}`
    case 'StringNode':
      return `"${node.value}"`
    case 'NumberNode':
      return node.value.toString()
    case 'BooleanNode':
      return node.value.toString()
    case 'IdentifierNode':
      return node.value
    case 'ParenFactorNode':
      return `(${stringOfNode(node.node)})`
    case 'RelNode':
      return `(${stringOfNode(node.left)} ${node.operator} ${stringOfNode(node.right)})`
    case 'ConjunctionNode':
      return `(${stringOfNode(node.left)} && ${stringOfNode(node.right)})`
    case 'DisjunctionNode':
      return `(${stringOfNode(node.left)} || ${stringOfNode(node.right)})`
    case 'ConsNode':
      return `(${stringOfNode(node.left)} :: ${stringOfNode(node.right)})`
    case 'NilNode':
      return '[]'
  }
}

export {
  StringNode,
  NumberNode,
  FactorLevel as FactorNode,
  TimesNode,
  DivideNode,
  TermLevel as TermNode,
  PlusNode,
  MinusNode,
  ArithLevel as ArithNode,
  BooleanNode,
  AppLevel as AppNode,
  AppNode as ApplicationNode,
  stringOfNode,
  RelLevel,
  RelNode,
  ConjunctionNode,
  ConjunctionLevel,
  DisjunctionNode,
  DisjunctionLevel,
  ConsNode,
  ConsLevel,
  NilNode,
  ExprLevel
}