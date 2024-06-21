import { DefnAST } from "../AST/defn/defn"
import { Expr } from "../AST/expr/expr"
import { L9Expr } from "../AST/expr/L9"
import { Pat } from "../AST/pat/Pat"
import { PatL2 } from "../AST/pat/PatL2"
import { Type } from "../AST/type/Type"
import { ImmMap } from "../util/ImmMap"
import { Maybe } from "../util/maybe"

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

export function objectsEqual(obj1: any, obj2: any): boolean {
  // Check if both arguments are objects
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  // Get keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Compare the number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Compare the keys and their types
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    const type1 = typeof obj1[key];
    const type2 = typeof obj2[key];

    if (type1 !== type2) {
      return false;
    }

    // If the value is an object, recursively compare the structures
    if (type1 === 'object' && !objectsEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * 
 * @param pat The pattern
 * @param type The type to bind to `pat`
 * @param staticEnv The current static environment
 * @returns A new static environment with the binding(s) from `pat` to `type`
 */
const bindPat = (pat: Pat, type: Type, staticEnv: StaticEnv) => {
  switch (pat.type) {
    case "BoolPatAST":
      return staticEnv
    case "IntPatAST":
      return staticEnv
    case "StringPat":
      return staticEnv
    case "UnitPatAST":
      return staticEnv
    case "IdPatAST":
      return staticEnv.set(pat.value, type)
    case "WildcardPatAST":
      return staticEnv
    case "ConsPatAST":
      throw new Error('ConsPat should not be provided to bindPat')
    case "NilPatAST":
      throw new Error('NilPat should not be provided to bindPat')
  }
}

/**
 * Returns a new static environment with the bindings from the definition
 * @param defn The definition to execute
 * @param staticEnv The static environment to execute the definition in
 */
const bindDefn = (defn: DefnAST, staticEnv: StaticEnv): [StaticEnv, TypeEquation[]] => {
  const pat = defn.pat
  const type: Maybe<Type> = defn.typeAnnotation
  const body = defn.body

  // get the type and equations for body
  let [bodyType, equations] = generate(body, staticEnv)

  const generalizedType = generalize(equations, staticEnv, bodyType)

  // bind the pattern to the type of the body

  const newStaticEnv = bindPat(pat, generalizedType, staticEnv)

  return [newStaticEnv, equations]
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
      return [instantiate(type), []]
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

      let standardEquations = [...inputEquations, ...outputEquations]

      if (expr.typeAnnotation.type != 'None') {
        standardEquations.push([inputType, expr.typeAnnotation.value])
      }

      return [t, standardEquations]


    case 'IfAST':
      const [conditionType, conditionEquations] = generate(expr.condition, staticEnv)
      const [thenType, thenEquations] = generate(expr.thenBranch, staticEnv)
      const [elseType, elseEquations] = generate(expr.elseBranch, staticEnv)

      return [
        thenType,
        [
          [conditionType, { type: 'BoolTypeAST' }],
          [thenType, elseType],
          ...conditionEquations,
          ...thenEquations,
          ...elseEquations
        ]
      ]

    case 'BlockAST':
      // we have a sequence of statements
      // the type of the block is the type of the last statement
      // generate type equations for each statement, adding the new bindings to the static environment when it's a definition

      const equations: TypeEquation[] = []

      for (let i = 0; i < expr.statements.length - 1; i++) {
        const statement: Expr | DefnAST = expr.statements[i]
        
        // if it's an expression, we can ignore it
        if (statement.type != "DefnAST") continue

        const [newStaticEnv, newEquations] = bindDefn(statement, staticEnv)

        equations.push(...newEquations)

        staticEnv = newStaticEnv

      }

      // the type of the block is the type of the last statement

      const lastStatement = expr.statements[expr.statements.length - 1]
      if (lastStatement.type === 'DefnAST') throw new Error('DefnAST should not be the last statement in a block')
      const [lastType, lastEquations] = generate(lastStatement, staticEnv)

      return [lastType, [...equations, ...lastEquations]]
    
    case 'ApplicationAST':
      const left = expr.left
      const right = expr.right

      // generate the type equations for the left and right sides of the application

      const [lt, le] = generate(left, staticEnv)
      const [rt, re] = generate(right, staticEnv)

      const ot = freshTypeVar()

      // it must hold that lt = rt -> ot

      return [ot, [[lt, { type: 'FunctionTypeAST', left: rt, right: ot }], ...le, ...re]]

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
  // old is on the left, new is on the right
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
    /*
    if (t2.type === 'TypeVarAST' && t2.name === typeVar) {
      if (t1.type === 'TypeVarAST') {
        return getTypeOfTypeVarIfPossible(t1.name, subst)
      }
      else {
        return t1
      }
    }
    */

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
      const newType = getTypeOfTypeVarIfPossible(type.name, staticEnv)
      // if newType is a type variable, return it
      // Otherwise, recurse
      if (newType.type === 'TypeVarAST') {
        return newType
      }
      else {
        return getType(newType, staticEnv)
      }
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
    case "PolymorphicTypeAST":
      return {
        type: "PolymorphicTypeAST",
        input: type.input,
        output: getType(type.output, staticEnv)
      }
    case 'AppTypeAST':
      return {
        type: 'AppTypeAST',
        left: getType(type.left, staticEnv),
        right: getType(type.right, staticEnv)
      }
    case 'ListTypeAST':
      return {
        type: 'ListTypeAST',
        t: getType(type.t, staticEnv)
      }
  }

}

const getTypeVariables = (type: Type): Type[] => {
  switch (type.type) {
    case 'TypeVarAST':
      return [type]
    case 'IntTypeAST':
      return []
    case 'BoolTypeAST':
      return []
    case 'StringTypeAST':
      return []
    case 'UnitTypeAST':
      return []
    case 'FunctionTypeAST':
      return [...getTypeVariables(type.left), ...getTypeVariables(type.right)]
    case 'AppTypeAST':
      return [...getTypeVariables(type.left), ...getTypeVariables(type.right)]
    case "ListTypeAST":
      return getTypeVariables(type.t)
    default:
      throw new Error('Unimplemented in getTypeVariables')
  }
}

const flattenTypes = (types: Type[]): Type[] => {
  if (types.length === 0) return []
  const [t, ...rest] = types

  switch (t.type) {
    case "AppTypeAST":
      return [...flattenTypes([t.left, t.right]), ...flattenTypes(rest)]
    case "FunctionTypeAST":
      return [...flattenTypes([t.left, t.right]), ...flattenTypes(rest)]
    case "ListTypeAST":
      return [...flattenTypes([t.t]), ...flattenTypes(rest)]
    default:
      return [t, ...flattenTypes(rest)]
  }
}

const assoc = (key: Type, map: [Type, Type][]): Type => {
  console.log("assoc")
  console.log(key)
  console.dir(map, {depth: null})
  if (map.length === 0) throw new Error('Key not found in assoc')
  const [[k, v] , ...rest] = map
  if (objectsEqual(key, k)) return v
  else return assoc(key, rest)
}

const replaceTypes = (replacements: [Type, Type][], type: Type): Type => {
  switch (type.type) {
    case "TypeVarAST":
      const replacement: Type = assoc(type, replacements)
      return replacement
    case "FunctionTypeAST":
      return {
        type: "FunctionTypeAST",
        left: replaceTypes(replacements, type.left),
        right: replaceTypes(replacements, type.right)
      }
    case "AppTypeAST":
      return {
        type: "AppTypeAST",
        left: replaceTypes(replacements, type.left),
        right: replaceTypes(replacements, type.right)
      }
    case "IntTypeAST":
      return type
    case "BoolTypeAST":
      return type
    case "StringTypeAST":
      return type
    case "UnitTypeAST":
      return type
    case "ListTypeAST":
      return {
        type: "ListTypeAST",
        t: replaceTypes(replacements, type.t)
      }
    case "PolymorphicTypeAST":
      throw new Error('Polymorphic types should not be present in replaceTypes')
  }
}

const deleteDuplicates = (objects: any[]): any[] => {
  const seen = new Set()
  return objects.filter(obj => {
    const key = JSON.stringify(obj)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })

}

export const abstractify = (type: Type, typeVars: Type[]): Type => {
  // add type arguments
  if (typeVars.length === 0) return type
  const [t, ...rest] = typeVars
  // t should be a typeVar

  if (t.type != "TypeVarAST") throw new Error('Type variable expected in abstractify')

  const wrappedWithT: Type = {
    type: "PolymorphicTypeAST",
    input: t.name,
    output: type 
  }

  return abstractify(wrappedWithT, rest)

}

const substituteInType = (toReplace: Type, replaceWith: Type, type: Type): Type => {
  switch (type.type) {
    case "TypeVarAST":
      if (objectsEqual(type, toReplace)) return replaceWith
      return type
    case "FunctionTypeAST":
      return {
        type: "FunctionTypeAST",
        left: substituteInType(toReplace, replaceWith, type.left),
        right: substituteInType(toReplace, replaceWith, type.right)
      }
    case "AppTypeAST":
      return {
        type: "AppTypeAST",
        left: substituteInType(toReplace, replaceWith, type.left),
        right: substituteInType(toReplace, replaceWith, type.right)
      }
    case "IntTypeAST":
      return type
    case "BoolTypeAST":
      return type
    case "StringTypeAST":
      return type
    case "UnitTypeAST":
      return type
    case "ListTypeAST":
      return {
        type: "ListTypeAST",
        t: substituteInType(toReplace, replaceWith, type.t)
      }
    case "PolymorphicTypeAST":
      return {
        type: "PolymorphicTypeAST",
        input: type.input,
        output: substituteInType(toReplace, replaceWith, type.output)
      }
  }

}

export const generalize = (equations: TypeEquation[], staticEnv : StaticEnv, t: Type): Type => {
  // finish inference of the binding expression
  const unified: TypeEquation[] = unify(equations)
  const u1 = getType(t, unified)

  const env : StaticEnv = staticEnv.map(t => getType(t, unified))

  const typeVars = getTypeVariables(u1)

  const envTypes = flattenTypes(staticEnv.values())

  let freeVariables = typeVars.filter(t => !envTypes.includes(t))
  
  // make then unique

  freeVariables = deleteDuplicates(freeVariables)

  console.log("freevariables: ")
  console.dir(freeVariables, {depth: null})

  const replacements: [Type, Type][] = freeVariables.map(v => [v, freshTypeVar()])

  console.log("replacements")

  console.log(replacements)

  const generalizedType = abstractify(replaceTypes(replacements, u1), replacements.map(([_, t]) => t))

  console.log("Generalized Type:")

  console.dir(generalizedType, {depth: null})

  return generalizedType
}

const instantiate = (type: Type): Type => {
  switch (type.type) {
    case "PolymorphicTypeAST":
      const input: string = type.input
      const output: Type = type.output
      const t = freshTypeVar()
      const tSubbed = substituteInType({ type: "TypeVarAST", name: input }, t, output)
      return instantiate(tSubbed)
    
    default:
      return type
  }
}

/**
 * Replace the type variables to be starting at 1 and in ascending order by first appearence
 * @param type The type to fix
 */
export const fixType = (type: Type) => {
  const typeVars = getTypeVariables(type)
  const fixedTypeVars = deleteDuplicates(typeVars)
  const replacements: [Type, Type][] = fixedTypeVars.map((v, i) => [v, { type: 'TypeVarAST', name: String(i + 1) }])
  return replaceTypes(replacements, type)
}

