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

type LBracket = {
  type: 'LBracket'
}

type RBracket = {
  type: 'RBracket'
}

type FnToken = {
  type: "FnToken"
}

type FNToken = {
  type: "FNToken"
}

type RightArrowToken = {
  type: "RightArrow"
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
type BoolTypeToken = {
  type: 'BoolTypeToken'
}
type StringTypeToken = {
  type: 'StringTypeToken'
}
type IntTypeToken = {
  type: 'IntTypeToken'
}
type UnitTypeToken = {
  type: 'UnitTypeToken'
}

type IfToken = {
  type: 'IfToken'
}

type ThenToken = {
  type: 'ThenToken'
}

type ElseToken = {
  type: 'ElseToken'
}

type ColonToken = {
  type: 'ColonToken'
}

type SemiColonToken = {
  type: 'SemiColonToken'
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

type Wildcard = {
  type: 'Wildcard'
}

type Const = {
  type: 'ValToken'
}

type Var = {
  type: 'VarToken'
}

type Equals = {
  type: "EqualsToken"
}

type LBrace = {
  type: 'LBrace'
}

type RBrace = {
  type: 'RBrace'
}
type FatArrow = {
  type: 'FatArrow'
}

type SwitchToken = {
  type: "SwitchToken"
}

type CaseToken = {
  type: "CaseToken"
}

export type Token = LAngle | Rangle | StringToken
  | NumberToken | BopToken | BooleanToken
  | IdentifierToken | LParen | RParen | NilToken | Wildcard | FnToken | RightArrowToken
  | BoolTypeToken | StringTypeToken | IntTypeToken | UnitTypeToken | FNToken
  | IfToken | ThenToken | ElseToken
  | LBracket | RBracket | ColonToken
  | Const | Var | Equals | SemiColonToken
  | LBrace | RBrace
  | FatArrow | SwitchToken | CaseToken