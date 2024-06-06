type UnitTypeAST = {
  type: 'UnitTypeAST'
}

type BoolTypeAST = {
  type: 'BoolTypeAST'
}

type StringTypeAST = {
  type: 'StringTypeAST'
}

type IntTypeAST = {
  type: 'IntTypeAST'
}

type TypeVarAST = {
  type: 'TypeVarAST',
  name: string
}

type AppTypeAST = {
  type: 'AppTypeAST',
  left: Type,
  right: Type
}

type FunctionTypeAST = {
  type: 'FunctionTypeAST',
  left: Type,
  right: Type
}

type PolymorphicTypeAST = {
  type: 'PolymorphicTypeAST',
  input: string,
  output: Type
}

export type Type = UnitTypeAST
  | BoolTypeAST
  | StringTypeAST
  | IntTypeAST
  | TypeVarAST
  | AppTypeAST
  | FunctionTypeAST
  | PolymorphicTypeAST

