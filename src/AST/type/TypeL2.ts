type UnitType = {
  type: 'UnitType'
}

type BoolType = {
  type: 'BoolType'
}

type StringType = {
  type: 'StringType'
}

type IntType = {
  type: 'IntType'
}

type ParenType = {
  type: 'ParenType',
  t: TypeL2
}

type TypeL1 = UnitType | BoolType | StringType | IntType | ParenType