import { DefnAST } from "../AST/defn/defn"
import { Expr } from "../AST/expr/expr"
import { L9Expr } from "../AST/expr/L9"
import { Pat } from "../AST/pat/Pat"
import { PatL2 } from "../AST/pat/PatL2"
import { stringOfType, Type } from "../AST/type/Type"
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
    // otherwise, compare the values
    if (obj1[key] !== obj2[key]) {
      return false
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
export const bindPat = (pat: Pat, type: Type, staticEnv: StaticEnv) => {
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
      const newStaticEnv = staticEnv.set(pat.value, type)
      return newStaticEnv
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

  const typeAnnotationEquation: TypeEquation[] = type.type === 'None' ? [] : [[generalizedType, type.value]]

  return [newStaticEnv, [...equations, ...typeAnnotationEquation]]
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
    case 'ListTypeAST':
      return {
        type: 'ListTypeAST',
        t: substituteTypeVars(toReplace, replaceWith, type.t)
      }
    case "PolymorphicTypeAST":
      return {
        type: "PolymorphicTypeAST",
        input: type.input,
        output: substituteTypeVars(toReplace, replaceWith, type.output)
      }
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

    case "ListTypeAST":
      return {
        type: "ListTypeAST",
        t: substituteTypes(toReplace, replaceWith, type.t)
      }
    case "PolymorphicTypeAST":
      return {
        type: "PolymorphicTypeAST",
        input: type.input,
        output: substituteTypes(toReplace, replaceWith, type.output)
      }

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
      /*  | CConsPat (p1, p2) ->
      let t1, env1, c1 = type_of_pat p1 static_env in
      let t2, env2, c2 = type_of_pat p2 static_env in

      (* since h :: t is a list, and h : t1 and t : t2, it must hold that [t1] =
         t2 return this constraint as well *)
      (CListType t1, env1 @ env2, (CListType t1, t2) :: (c1 @ c2)) */


      const [t1, c1, env1] = generatePattern(pattern.left)
      const [t2, c2, env2] = generatePattern(pattern.right)

      // since h :: t is a list, and h : t1 and t : t2, it must hold that [t1] = t2. make this a type equation

      const listType: Type = {
        type: "ListTypeAST",
        t: t1
      }

      return [listType, [...c1, ...c2, [listType, t2]], ImmMap.union(env1, env2)]

    case "NilPatAST":
      // it must be of a list type
      const typeVar2 = freshTypeVar()
      return [{ type: 'ListTypeAST', t: typeVar2 }, [], new ImmMap([])]
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
      const typeVar = freshTypeVar()
      return [{ type: 'ListTypeAST', t: typeVar }, []]
    case 'UnitAST':
      return [{ type: 'UnitTypeAST' }, []]
    case 'IdentifierAST':
      const type: Type | undefined = staticEnv.get(expr.value)
      if (type === undefined) {
        throw new Error(`Type equation generation failed: identifier ${expr.value} not found in static environment`)
      }
      return [instantiate(type), []]
    case 'PlusAST':
    case "MinusAST":
    case "TimesAST":
    case "DivideAST":
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

    case "MatchAST":
      // generate the type of the expression we are matching against

      const [matchingAgainstType, matchingAgainstEquations] = generate(expr.expr, staticEnv)

      // generate the type and constraints of the pattern of each case

      const cases = expr.cases

      const typeThatAllCasesMustBe = freshTypeVar()

      const branchConstraints: TypeEquation[] = cases.flatMap(([pat, branch]) => {
        const [patType, patEquations, newBindings] = generatePattern(pat)
        const [branchType, branchEquations] = generate(branch, ImmMap.union(newBindings, staticEnv))

        // patType must equal matchingAgainstType
        // branchType must equal typeThatAllCasesMustBe

        return [
          [patType, matchingAgainstType],
          [branchType, typeThatAllCasesMustBe],
          ...patEquations,
          ...branchEquations
        ]

      })

      return [typeThatAllCasesMustBe, [...matchingAgainstEquations, ...branchConstraints]]

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

    case "ConjunctionAST":
    case "DisjunctionAST":
      const [leftType1, leftEquations1] = generate(expr.left, staticEnv)
      const [rightType1, rightEquations1] = generate(expr.right, staticEnv)

      return [
        { type: 'BoolTypeAST' },
        [
          [leftType1, { type: 'BoolTypeAST' }],
          [rightType1, { type: 'BoolTypeAST' }],
          ...leftEquations1,
          ...rightEquations1
        ]
      ]
    case "RelAST":
      const [leftType2, leftEquations2] = generate(expr.left, staticEnv)
      const [rightType2, rightEquations2] = generate(expr.right, staticEnv)

      return [
        { type: 'BoolTypeAST' },
        [
          [leftType2, { type: 'IntTypeAST' }],
          [rightType2, { type: 'IntTypeAST' }],
          ...leftEquations2,
          ...rightEquations2
        ]
      ]
    
    case "ConsAST":
      const [leftType3, leftEquations3] = generate(expr.left, staticEnv)
      const [rightType3, rightEquations3] = generate(expr.right, staticEnv)

      return [
        { type: 'ListTypeAST', t: leftType3 },
        [
          [rightType3, { type: 'ListTypeAST', t: leftType3 }],
          ...leftEquations3,
          ...rightEquations3
        ]
      ]
  }
}

export const unify = (equations: TypeEquation[]): TypeEquation[] => {
  if (equations.length === 0) {
    return []
  }

  const [[t1, t2], ...rest] = equations

  if (objectsEqual(t1, t2)) {
    return unify(rest)
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

    return [[t2, t1], ...unify(newRest)]
  }

  // if they are both function types, unify the left and right types

  if (t1.type === 'FunctionTypeAST' && t2.type === 'FunctionTypeAST') {
    const [left1, right1] = [t1.left, t1.right]
    const [left2, right2] = [t2.left, t2.right]
    const newEquations: TypeEquation[] = [[left1, left2], [right1, right2]]
    return unify([...newEquations, ...rest])
  }

  if (t1.type === "ListTypeAST" && t2.type === "ListTypeAST") {
    const [t1t, t2t] = [t1.t, t2.t]
    const newEquations: TypeEquation[] = [[t1t, t2t]]
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
  const getTypeVariablesAux = (type: Type): Type[] => {
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
        return [...getTypeVariablesAux(type.left), ...getTypeVariablesAux(type.right)]
      case 'AppTypeAST':
        return [...getTypeVariablesAux(type.left), ...getTypeVariablesAux(type.right)]
      case "ListTypeAST":
        return getTypeVariablesAux(type.t)

      case "PolymorphicTypeAST":
        // there is the input type and the variables inside of the output type

        const inputType: Type = {
          type: "TypeVarAST",
          name: type.input
        }

        return [inputType, ...getTypeVariablesAux(type.output)]

      default:
        throw new Error('Unimplemented in getTypeVariables')
    }
  }

  const typeVars = getTypeVariablesAux(type)

  // get rid of duplicates
  // compare by object structure, not reference

  return deleteDuplicates(typeVars)
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
  for (let i = 0; i < map.length; i++) {
    const [k, v] = map[i]
    if (objectsEqual(k, key)) {
      return v
    }
  }
  throw new Error('Key not found in assoc')
}

const replaceTypes = (replacements: [Type, Type][], type: Type): Type => {
  switch (type.type) {
    case "TypeVarAST":
      try {
        const replacement: Type = assoc(type, replacements)
        return replacement
      } catch (e) {
        return type
      }
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
      // replace the input type manually

      const newInputType: Type = assoc({ type: "TypeVarAST", name: type.input }, replacements)

      // newInputType is guaranteed to be a TypeVarAST

      if (newInputType.type != "TypeVarAST") throw new Error('Type variable expected in replaceTypes')

      const newOutputType: Type = replaceTypes(replacements, type.output)

      return {
        type: "PolymorphicTypeAST",
        input: newInputType.name,
        output: newOutputType
      }
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

export const generalizeTypeVars = (type: Type): Type => {
  const typeVars = getTypeVariables(type)
  
  const replacements: [Type, Type][] = typeVars.map(t => [t, freshTypeVar()])

  // make the replacements

  const replaced = replaceTypes(replacements, type)

  // then, abstractify

  return abstractify (replaced, replacements.map(([_, t]) => t).reverse())

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

/*
and generalize (constraints : type_equations) (env : static_env)
    (type_env : (string * c_type) list) (t : c_type) : c_type =
  let constraints : type_equations = replace_written_types constraints in
  let unified : substitutions = reduce_eq constraints type_env in
  let u1 : c_type = get_type t unified in
  let env : static_env =
    List.map (fun (id, t) -> (id, get_type t unified)) env
  in
  let type_vars : c_type list = get_type_vars u1 in
  let env_types : c_type list = env |> List.map snd |> flatten_env_types in
  let free_vars : c_type list =
    List.filter (fun t -> not (List.mem t env_types)) type_vars
    |> List.sort_uniq compare
  in
  let variable_replacements : (c_type * c_type) list =
    List.map (fun t -> (t, fresh_universal_type ())) free_vars
  in
  replace_types u1 variable_replacements
*/

const includes = (arr: any[], el: any): boolean => {
  for (let i = 0; i < arr.length; i++) {
    if (objectsEqual(arr[i], el)) {
      return true
    }
  }
  return false
}

export const generalize = (equations: TypeEquation[], staticEnv : StaticEnv, t: Type): Type => {
  // finish inference of the binding expression
  const unified: TypeEquation[] = unify(equations)
  const u1 = getType(t, unified)

  const env : StaticEnv = staticEnv.map(t => getType(t, unified))

  const typeVars = getTypeVariables(u1)

  const envTypes = flattenTypes(env.values())

  let freeVariables = typeVars.filter(t => !includes(envTypes, t))
  
  // make then unique

  freeVariables = deleteDuplicates(freeVariables)

  const replacements: [Type, Type][] = freeVariables.map(v => [v, freshTypeVar()])

  //if (replacements.length === 0) return u1

  const generalizedType = abstractify(replaceTypes(replacements, u1), replacements.map(([_, t]) => t))

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
  
  const replacements: [Type, Type][] = typeVars.map((t: Type, i: number) => {
    const tt: Type = {
      type: "TypeVarAST",
      name: String(i + 1)
    }

    return [t, tt]
  })

  const fixed = replaceTypes(replacements, type)
  
  return fixed
}

export const typeOfExpr = (expr: Expr, env: ImmMap<string, Type>): Type => {
  // generate the type equations
  const [t, equations] = generate(expr, env)
  // unify the equations
  const unified = unify(equations)
  const tt = getType(t, unified)
  // fix the type
  return tt
}