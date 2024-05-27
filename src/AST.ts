import { RelationalOperatorType } from "./token"

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

type FactorLevel =
  | StringNode
  | NumberNode
  | BooleanNode
  | IdentifierNode
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

// string of node
// put parenthesis to make the order of operations clear
const stringOfNode = (node: DisjunctionLevel): string => {
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
  DisjunctionLevel
}