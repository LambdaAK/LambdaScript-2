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

type ListTypeAST = {
  type: 'ListTypeAST',
  t: Type
}

export type Type = UnitTypeAST
  | BoolTypeAST
  | StringTypeAST
  | IntTypeAST
  | TypeVarAST
  | AppTypeAST
  | FunctionTypeAST
  | PolymorphicTypeAST
  | ListTypeAST

export const stringOfType = (type: Type): string => {
  switch (type.type) {
    case 'UnitTypeAST':
      return 'Unit'
    case 'BoolTypeAST':
      return 'Bool'
    case 'StringTypeAST':
      return 'String'
    case 'IntTypeAST':
      return 'Int'
    case 'TypeVarAST':
      return type.name
    case 'AppTypeAST':
      return `(${stringOfType(type.left)} ${stringOfType(type.right)})`
    case 'FunctionTypeAST':
      return `(${stringOfType(type.left)} -> ${stringOfType(type.right)})`
    case 'PolymorphicTypeAST':
      return `(${type.input} -> ${stringOfType(type.output)})`
    case 'ListTypeAST':
      return `[${stringOfType(type.t)}]`
  }
}