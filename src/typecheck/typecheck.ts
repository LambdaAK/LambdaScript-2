import { Expr } from "../AST/expr/expr"
import { L9Expr } from "../AST/expr/L9"
import { Pat } from "../AST/pat/Pat"
import { PatL2 } from "../AST/pat/PatL2"
import { Type } from "../AST/type/Type"
import { ImmMap } from "../util/ImmMap"

type TypeEquation = [Type, Type]

// a mapping from identifiers to types
type StaticEnv = ImmMap<string, Type>

let typeVarCounter = 1
const freshTypeVar: () => Type = () => {
  const typeVar: Type = {
    type: 'TypeVarAST',
    name: String(typeVarCounter)
  }
  typeVarCounter++
  return typeVar
}

export const substituteTypeVars = (toReplace: string, replaceWith: string, type: Type): Type => {
  // replace all occurrences of toReplace with replaceWith in type
  switch (type.type) {
    case 'TypeVarAST':
      if (type.name === toReplace) {
        return {
          type: 'TypeVarAST',
          name: replaceWith
        }
      }
      return type
    case 'IntTypeAST':
      return type
    case 'BoolTypeAST':
      return type
    case 'StringTypeAST':
      return type
    case 'UnitTypeAST':
      return type
    case 'FunctionTypeAST':
      return {
        type: 'FunctionTypeAST',
        left:
          substituteTypeVars(toReplace, replaceWith, type.left),
        right: substituteTypeVars(toReplace, replaceWith, type.right)
      }
    case 'AppTypeAST':
      return {
        type: 'AppTypeAST',
        left: substituteTypeVars(toReplace, replaceWith, type.left),
        right: substituteTypeVars(toReplace, replaceWith, type.right)
      }
    default:
      throw new Error('Unimplemented in substitute')
  }
}

const substituteTypes = (toReplace: Type, replaceWith: Type, type: Type): Type => {
  // replace all occurrences of toReplace with replaceWith in type
  switch (type.type) {
    case 'TypeVarAST':
      if (type === toReplace) {
        return replaceWith
      }
      return type
    case 'IntTypeAST':
      return type
    case 'BoolTypeAST':
      return type
    case 'StringTypeAST':
      return type
    case 'UnitTypeAST':
      return type
    case 'FunctionTypeAST':
      return {
        type: 'FunctionTypeAST',
        left: substituteTypes(toReplace, replaceWith, type.left),
        right: substituteTypes(toReplace, replaceWith, type.right)

      }

    case 'AppTypeAST':
      return {
        type: 'AppTypeAST',
        left: substituteTypes(toReplace, replaceWith, type.left),
        right: substituteTypes(toReplace, replaceWith, type.right)
      }
    default:
      throw new Error('Unimplemented in substitute')
  }

}

const generatePattern = (pattern: Pat): [Type, TypeEquation[], StaticEnv] => {
  switch (pattern.type) {
    case "BoolPatAST":
      return [{ type: 'BoolTypeAST' }, [], new ImmMap([])]
    case "IntPatAST":
      return [{ type: 'IntTypeAST' }, [], new ImmMap([])]
    case "StringPat":
      return [{ type: 'StringTypeAST' }, [], new ImmMap([])]
    case "UnitPatAST":
      return [{ type: 'UnitTypeAST' }, [], new ImmMap([])]
    case "IdPatAST":

      let typeVar = freshTypeVar()

      return [typeVar, [], new ImmMap([[pattern.value, typeVar]])]
    case "WildcardPatAST":
      return [freshTypeVar(), [], new ImmMap([])]
    case "ConsPatAST":
      throw new Error('ConsPat not implemented in generatePattern')
    case "NilPatAST":
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
    case 'NumberAST':
      return [{ type: 'IntTypeAST' }, []]
    case 'StringAST':
      return [{ type: 'StringTypeAST' }, []]
    case 'BooleanAST':
      return [{ type: 'BoolTypeAST' }, []]
    case 'NilAST':
      throw new Error('NilNode not implemented in generate')
    case 'IdentifierAST':
      const type: Type | undefined = staticEnv.get(expr.value)
      if (type === undefined) {
        throw new Error(`Type equation generation failed: identifier ${expr.value} not found in static environment`)
      }
      return [type, []]
    case 'PlusAST':
      const [leftType, leftEquations] = generate(expr.left, staticEnv)
      const [rightType, rightEquations] = generate(expr.right, staticEnv)


      return [
        { type: 'IntTypeAST' },
        [
          [leftType, { type: 'IntTypeAST' }],
          [rightType, { type: 'IntTypeAST' }],
          ...leftEquations,
          ...rightEquations
        ]
      ]

    case 'FunctionAST':

      const [inputType, inputEquations, newBindings] = generatePattern(expr.pattern)

      // generate the output type under the assumption that the pattern has type inputType

      const newStaticEnv = ImmMap.union(newBindings, staticEnv)

      const [outputType, outputEquations] = generate(expr.body, newStaticEnv)

      /*
        The type of the function is inputType -> outputType
      */

      const t: Type = {
        type: 'FunctionTypeAST',
        left: inputType,
        right: outputType
      }

      return [t, [...inputEquations, ...outputEquations]]

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
    if (t1.type === 'IntTypeAST' || t1.type === 'BoolTypeAST' || t1.type === 'StringTypeAST' || t1.type === 'UnitTypeAST') {
      return unify(rest)
    } ``
  }

  // if they are both type variables, substitute one for the other

  if (t1.type === 'TypeVarAST' && t2.type === 'TypeVarAST') {
    const subst = new ImmMap([[t1, t2]])
    // replace t1 with t2 in the rest of the equations
    const newRest: TypeEquation[] = rest.map(([t, tt]) => [substituteTypeVars(t1.name, t2.name, t), substituteTypeVars(t1.name, t2.name, tt)])

    return [[t1, t2], ...unify(newRest)]
  }

  if (t1.type === 'TypeVarAST') {
    // t1 is a type variable
    // replace t1 everywhere with t2
    // replace t1 with t2 in the rest of the equations
    const newRest: TypeEquation[] = rest.map(([t, tt]) => [substituteTypes(t1, t2, t), substituteTypes(t1, t2, tt)])

    return [[t1, t2], ...unify(newRest)]
  }

  if (t2.type === 'TypeVarAST') {
    // t2 is a type variable
    // replace t2 everywhere with t1
    // replace t2 with t1 in the rest of the equations
    const newRest: TypeEquation[] = rest.map(([t, tt]) => [substituteTypes(t2, t1, t), substituteTypes(t2, t1, tt)])

    return [[t1, t2], ...unify(newRest)]
  }

  // if they are both function types, unify the left and right types

  if (t1.type === 'FunctionTypeAST' && t2.type === 'FunctionTypeAST') {
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
    if (t1.type === 'TypeVarAST' && t1.name === typeVar) {
      if (t2.type === 'TypeVarAST') {
        return getTypeOfTypeVarIfPossible(t2.name, subst)
      }
      else {
        return t2
      }
    }
    if (t2.type === 'TypeVarAST' && t2.name === typeVar) {
      if (t1.type === 'TypeVarAST') {
        return getTypeOfTypeVarIfPossible(t1.name, subst)
      }
      else {
        return t1
      }
    }

  }

  return {
    type: 'TypeVarAST',
    name: typeVar
  }

}

export const getType = (type: Type, staticEnv: TypeEquation[]): Type => {


  // recurse through t and substitute type variables with thier actual types, when possible
  switch (type.type) {
    case 'TypeVarAST':
      return getTypeOfTypeVarIfPossible(type.name, staticEnv)
    case 'IntTypeAST':
      return type
    case 'BoolTypeAST':
      return type
    case 'StringTypeAST':
      return type
    case 'UnitTypeAST':
      return type
    case 'FunctionTypeAST':
      return {
        type: 'FunctionTypeAST',
        left: getType(type.left, staticEnv),
        right: getType(type.right, staticEnv)
      }

    default:
      throw new Error('Unimplemented in getType')
  }


}