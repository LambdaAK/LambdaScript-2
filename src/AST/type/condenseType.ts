import { Type } from "./Type";


export const condenseType = (type: TypeL4): Type => {
  switch (type.type) {
    case "UnitType":
      return {
        type: "UnitTypeAST"
      }
    case "BoolType":
      return {
        type: "BoolTypeAST"
      }

    case "StringType":
      return {
        type: "StringTypeAST"
      }

    case "IntType":
      return {
        type: "IntTypeAST"
      }

    case "TypeVar":
      return {
        type: "TypeVarAST",
        name: type.name
      }

    case "ParenType":
      return condenseType(type.t)

    case "AppType":
      return {
        type: "AppTypeAST",
        left: condenseType(type.left),
        right: condenseType(type.right)
      }

    case "FunctionType":
      return {
        type: "FunctionTypeAST",
        left: condenseType(type.left),
        right: condenseType(type.right)
      }

    case "PolymorphicType":
      return {
        type: "PolymorphicTypeAST",
        input: type.input,
        output: condenseType(type.output)
      }

    case 'ListType':
      return {
        type: 'ListTypeAST',
        t: condenseType(type.t)
      }


  }
}