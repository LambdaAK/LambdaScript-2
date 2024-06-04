import { L9Expr } from "../AST/expr/L9"
import { PatL2 } from "../AST/pat/PatL2"

type Type = TypeL4
type TypeEquation = [Type, Type]

type Expr = L9Expr

type Pat = PatL2

// a mapping from identifiers to types
type StaticEnv = Map<string, Type>

let typeVarCounter = 1
const freshTypeVar: () => Type = () => {
  const typeVar: Type = {
    type: 'TypeVar',
    name: String(typeVarCounter)
  }
  typeVarCounter++
  return typeVar
}

const generatePattern = (pattern: Pat): [Type, TypeEquation[]] => {
  switch (pattern.type) {
    case "BoolPat":
      return [{ type: 'BoolType' }, []]
    case "IntPat":
      return [{ type: 'IntType' }, []]
    case "StringPat":
      return [{ type: 'StringType' }, []]
    case "UnitPat":
      return [{ type: 'UnitType' }, []]
    case "IdPat":
      return [freshTypeVar(), []]
    case "WildcardPat":
      return [freshTypeVar(), []]
    case "ParenPat":
      return generatePattern(pattern.node)
    case "ConsPat":
      throw new Error('ConsPat not implemented in generatePattern')
    case "NilPat":
      throw new Error('NilPat not implemented in generatePattern')
  }
}

/**
 * Generate type equations for an expression
 * @param expr The expression to generate type equations for
 * @returns A tuple containing the type of the expression and the type equations
 */
export const generate = (expr: Expr, staticEnv: StaticEnv): [Type, TypeEquation[]] => {
  switch (expr.type) {
    case 'NumberNode':
      return [{ type: 'IntType' }, []]
    case 'StringNode':
      return [{ type: 'StringType' }, []]
    case 'BooleanNode':
      return [{ type: 'BoolType' }, []]
    case 'NilNode':
      throw new Error('NilNode not implemented in generate')
    case 'IdentifierNode':
      const type: Type | undefined = staticEnv.get(expr.value)
      if (type === undefined) {
        throw new Error(`Type equation generation failed: identifier ${expr.value} not found in static environment`)
      }
      return [type, []]
    case 'PlusNode':
      const [leftType, leftEquations] = generate(expr.left, staticEnv)
      const [rightType, rightEquations] = generate(expr.right, staticEnv)


      return [
        { type: 'IntType' },
        [
          [leftType, { type: 'IntType' }],
          [rightType, { type: 'IntType' }],
          ...leftEquations,
          ...rightEquations
        ]
      ]


    case 'FunctionNode':
      const [outputType, outputEquations] = generate(expr.body, staticEnv)
      const [inputType, inputEquations] = generatePattern(expr.pattern)

      /*
        The type of the function is inputType -> outputType
      */

      const t: Type = {
        type: 'FunctionType',
        left: {
          type: "ParenType",
          t: inputType
        },
        right: {
          type: "ParenType",
          t: outputType
        }
      }

      return [t, [...inputEquations, ...outputEquations]]

      throw new Error('FunctionNode not implemented in generate')
    default:
      throw new Error('Unimplemented in generate')
  }
}