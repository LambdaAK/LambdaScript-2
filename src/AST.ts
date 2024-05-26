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
  node: ArithLevel
}

type FactorLevel = StringNode | NumberNode | BooleanNode | IdentifierNode | ParenFactorNode

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

type TermLevel = AppLevel | TimesNode | DivideNode

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

type ArithLevel = TermLevel | PlusNode | MinusNode

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
  AppNode as ApplicationNode
}