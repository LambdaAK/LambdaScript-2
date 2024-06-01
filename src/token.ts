type LAngle = {
  type: 'LAngle'
}
type Rangle = {
  type: 'RAngle'
}

type LParen = {
  type: 'LParen'
}

type RParen = {
  type: 'RParen'
}

type StringToken = {
  type: 'StringToken'
  value: string
}
type NumberToken = {
  type: 'NumberToken'
  value: number
}
type BooleanToken = {
  type: 'BooleanToken'
  value: boolean
}
type NilToken = {
  type: 'NilToken'
}

export enum RelationalOperatorType {
  LessThan = '<',
  GreaterThan = '>',
  LessThanEqual = '<=',
  GreaterThanEqual = '>=',
  Equal = '==',
  NotEqual = '!='
}

export enum AddOperatorType {
  Plus = '+',
  Minus = '-'
}

export enum MultiplyOperatorType {
  Times = '*',
  Divide = '/'
}

export enum DisjunctionOperatorType {
  Or = '||'
}

export enum ConjunctionOperatorType {
  And = '&&'
}

export enum ConsOperatorType {
  Cons = '::'
}

export type BinaryOperatorType =
  | RelationalOperatorType
  | AddOperatorType
  | MultiplyOperatorType
  | ConjunctionOperatorType
  | DisjunctionOperatorType
  | ConsOperatorType

type BopToken = {
  type: 'BopToken'
  operator: BinaryOperatorType
}
type IdentifierToken = {
  type: 'IdentifierToken'
  value: string
}

export type Token = LAngle | Rangle | StringToken
  | NumberToken | BopToken | BooleanToken
  | IdentifierToken | LParen | RParen | NilToken