import { L9Expr } from "../AST/expr/L9"
import { PatL2 } from "../AST/pat/PatL2"
import { ImmMap } from "../util/ImmMap"

type Type = TypeL4
type TypeEquation = [Type, Type]

type Expr = L9Expr

type Pat = PatL2

// a mapping from identifiers to types
type StaticEnv = ImmMap<string, Type>

let typeVarCounter = 1
const freshTypeVar: () => Type = () => {
  const typeVar: Type = {
    type: 'TypeVar',
    name: String(typeVarCounter)
  }
  typeVarCounter++
  return typeVar
}

export const substituteTypeVars = (toReplace: string, replaceWith: string, type: Type): Type => {
  // replace all occurrences of toReplace with replaceWith in type
  switch (type.type) {
    case 'TypeVar':
      if (type.name === toReplace) {
        return {
          type: 'TypeVar',
          name: replaceWith
        }
      }
      return type
    case 'IntType':
      return type
    case 'BoolType':
      return type
    case 'StringType':
      return type
    case 'UnitType':
      return type
    case 'FunctionType':
      return {
        type: 'FunctionType',
        left: {
          type: 'ParenType',
          t: substituteTypeVars(toReplace, replaceWith, type.left)
        },
        right: {
          type: 'ParenType',
          t: substituteTypeVars(toReplace, replaceWith, type.right)
        }
      }
    case 'ParenType':
      return {
        type: 'ParenType',
        t: substituteTypeVars(toReplace, replaceWith, type.t)
      }
    case 'AppType':
      return {
        type: 'AppType',
        left: { type: "ParenType", t: substituteTypeVars(toReplace, replaceWith, type.left) },
        right: {
          type: "ParenType", t: substituteTypeVars(toReplace, replaceWith, type.right)
        }

      }
    default:
      throw new Error('Unimplemented in substitute')
  }
}

const substituteTypes = (toReplace: Type, replaceWith: Type, type: Type): Type => {
  // replace all occurrences of toReplace with replaceWith in type
  switch (type.type) {
    case 'TypeVar':
      if (type === toReplace) {
        return replaceWith
      }
      return type
    case 'IntType':
      return type
    case 'BoolType':
      return type
    case 'StringType':
      return type
    case 'UnitType':
      return type
    case 'FunctionType':
      return {
        type: 'FunctionType',
        left: {
          type: 'ParenType',
          t: substituteTypes(toReplace, replaceWith, type.left)
        },
        right: {
          type: 'ParenType',
          t: substituteTypes(toReplace, replaceWith, type.right)
        }
      }
    case 'ParenType':
      return {
        type: 'ParenType',
        t: substituteTypes(toReplace, replaceWith, type.t)
      }
    case 'AppType':
      return {
        type: 'AppType',
        left: { type: "ParenType", t: substituteTypes(toReplace, replaceWith, type.left) },
        right: {
          type: "ParenType", t: substituteTypes(toReplace, replaceWith, type.right)
        }

      }
    default:
      throw new Error('Unimplemented in substitute')
  }

}


const generatePattern = (pattern: Pat): [Type, TypeEquation[], StaticEnv] => {
  switch (pattern.type) {
    case "BoolPat":
      return [{ type: 'BoolType' }, [], new ImmMap([])]
    case "IntPat":
      return [{ type: 'IntType' }, [], new ImmMap([])]
    case "StringPat":
      return [{ type: 'StringType' }, [], new ImmMap([])]
    case "UnitPat":
      return [{ type: 'UnitType' }, [], new ImmMap([])]
    case "IdPat":

      let typeVar = freshTypeVar()

      return [typeVar, [], new ImmMap([[pattern.value, typeVar]])]
    case "WildcardPat":
      return [freshTypeVar(), [], new ImmMap([])]
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
 * @returns A tuple containing the type of the expression, the type equations, and new static bindings resulting from matching the pattern
 */
export const generate = (expr: Expr, staticEnv: StaticEnv): [Type, TypeEquation[]] => {

  /*
  c_pat -> static_env -> c_type * static_env * substitutions
  */

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

      const [inputType, inputEquations, newBindings] = generatePattern(expr.pattern)

      // generate the output type under the assumption that the pattern has type inputType

      const newStaticEnv = ImmMap.union(newBindings, staticEnv)

      const [outputType, outputEquations] = generate(expr.body, newStaticEnv)

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

export const unify = (equations: TypeEquation[]): TypeEquation[] => {
  if (equations.length === 0) {
    return []
  }

  const [[t1, t2], ...rest] = equations

  if (t1.type === t2.type) {
    // check if they're both base types
    if (t1.type === 'IntType' || t1.type === 'BoolType' || t1.type === 'StringType' || t1.type === 'UnitType') {
      return unify(rest)
    } ``
  }

  // if they are both type variables, substitute one for the other

  if (t1.type === 'TypeVar' && t2.type === 'TypeVar') {
    const subst = new ImmMap([[t1, t2]])
    // replace t1 with t2 in the rest of the equations
    const newRest: TypeEquation[] = rest.map(([t, tt]) => [substituteTypeVars(t1.name, t2.name, t), substituteTypeVars(t1.name, t2.name, tt)])

    return [[t1, t2], ...unify(newRest)]
  }

  if (t1.type === 'TypeVar') {
    // t1 is a type variable
    // replace t1 everywhere with t2
    // replace t1 with t2 in the rest of the equations
    const newRest: TypeEquation[] = rest.map(([t, tt]) => [substituteTypes(t1, t2, t), substituteTypes(t1, t2, tt)])

    return [[t1, t2], ...unify(newRest)]
  }

  if (t2.type === 'TypeVar') {
    // t2 is a type variable
    // replace t2 everywhere with t1
    // replace t2 with t1 in the rest of the equations
    const newRest: TypeEquation[] = rest.map(([t, tt]) => [substituteTypes(t2, t1, t), substituteTypes(t2, t1, tt)])

    return [[t1, t2], ...unify(newRest)]
  }

  // if they are both function types, unify the left and right types

  if (t1.type === 'FunctionType' && t2.type === 'FunctionType') {
    const [left1, right1] = [t1.left, t1.right]
    const [left2, right2] = [t2.left, t2.right]
    const newEquations: TypeEquation[] = [[left1, left2], [right1, right2]]
    return unify([...newEquations, ...rest])
  }

  // unimplemented / not unifiable
  console.dir(t1, { depth: null })
  console.dir(t2, { depth: null })
  throw new Error(`Unification failed`)
}

const getTypeOfTypeVarIfPossible = (typeVar: string, subst: TypeEquation[]): Type => {
  // if there is a substitution for typeVar, return it

  for (let i = 0; i < subst.length; i++) {
    const [t1, t2] = subst[i]
    if (t1.type === 'TypeVar' && t1.name === typeVar) {
      if (t2.type === 'TypeVar') {
        return getTypeOfTypeVarIfPossible(t2.name, subst)
      }
      else {
        return t2
      }
    }
    if (t2.type === 'TypeVar' && t2.name === typeVar) {
      if (t1.type === 'TypeVar') {
        return getTypeOfTypeVarIfPossible(t1.name, subst)
      }
      else {
        return t1
      }
    }

  }

  return {
    type: 'TypeVar',
    name: typeVar
  }

}

export const getType = (type: Type, staticEnv: TypeEquation[]): Type => {


  // recurse through t and substitute type variables with thier actual types, when possible
  switch (type.type) {
    case 'TypeVar':
      return getTypeOfTypeVarIfPossible(type.name, staticEnv)
    case 'IntType':
      return type
    case 'BoolType':
      return type
    case 'StringType':
      return type
    case 'UnitType':
      return type
    case 'FunctionType':
      return {
        type: 'FunctionType',
        left: {
          type: 'ParenType',
          t: getType(type.left, staticEnv)
        },
        right: {
          type: 'ParenType',
          t: getType(type.right, staticEnv)
        }
      }
    case 'ParenType':
      return {
        type: 'ParenType',
        t: getType(type.t, staticEnv)
      }

    default:
      throw new Error('Unimplemented in getType')
  }


}