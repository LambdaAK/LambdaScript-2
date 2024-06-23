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

const stringOfTypeVar = (t: number) => {
  // 1 should map to a, 2 to b
  // 26 to z, 27 to aa, 28 to ab

  let s = ''
  while (t > 0) {
    const r = t % 26
    s = String.fromCharCode(r + 96) + s
    t = Math.floor(t / 26)
  }

  return s
}

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
      return stringOfTypeVar(Number.parseInt(type.name))
    case 'AppTypeAST':
      // if the right side is an application, wrap it in parens
      const r: string = type.right.type === 'AppTypeAST' ? `(${stringOfType(type.right)})` : stringOfType(type.right)
      const l: string = stringOfType(type.left)
      return `${l} ${r}`
    case 'FunctionTypeAST':
      const leftString: string = type.left.type === 'FunctionTypeAST' ? `(${stringOfType(type.left)})` : stringOfType(type.left)
      const rightString: string = stringOfType(type.right)
      return `${leftString} -> ${rightString}`
    case 'PolymorphicTypeAST':
      return `${stringOfTypeVar(Number.parseInt(type.input))} . ${stringOfType(type.output)}`
    case 'ListTypeAST':
      return `[${stringOfType(type.t)}]`
  }
}