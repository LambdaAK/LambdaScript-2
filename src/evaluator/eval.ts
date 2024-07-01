import { DefnAST } from "../AST/defn/defn"
import { Expr } from "../AST/expr/expr"
import { Pat } from "../AST/pat/Pat"
import { isNone, Maybe, none, some } from "../util/maybe"
import { Env, Value } from "./value"

const bindPat =(pat : Pat, value : Value, env: Env): Maybe<Env> => {
  switch (pat.type) {
    case "IdPatAST":
      return some(env.set(pat.value, value))
    case "BoolPatAST":
      if (value.type !== "BoolValue") return none()
      // check if they have the same value
      if (value.value !== pat.value) return none()
      return some(env)
    case "IntPatAST":
      if (value.type !== "IntValue") return none()
      // check if they have the same value
      if (value.value !== pat.value) return none()
      return some(env)
    case "UnitPatAST":
      if (value.type !== "UnitValue") return none()
      return some(env)
    case "NilPatAST":
      if (value.type !== "NilValue") return none()
      return some(env)
    case "ConsPatAST":
      if (value.type !== "ConsValue") {
        return none()
      }
      let headEnv = bindPat(pat.left, value.head, env)
      if (isNone(headEnv)) {
        return none()
      }
      const tailEnv = bindPat(pat.right, value.tail, headEnv.value)
      
      return tailEnv

    case "StringPat":
      if (value.type !== "StringValue") return none()
      return some(env)

    case "WildcardPatAST":
      // matches anything
      return some(env)
  }
}

const evalDefn = (defn: DefnAST, env: Env): Env => {
  // evaluate the right hand side of the definition
  const value: Value = evalExpr(defn.body, env)
  // bind the value to the pattern
  const newEnvMaybe: Maybe<Env> = bindPat(defn.pat, value, env)

  if (isNone(newEnvMaybe)) {
    throw new Error("Pattern match failed in evalDefn")
  }

  return newEnvMaybe.value

}


const evalExpr = (expr: Expr, env: Env): Value => {

  let left: Value = { type: "UnitValue" }
  let right: Value = { type: "UnitValue" }

  switch (expr.type) {
    case "StringAST":
      return { type: "StringValue", value: expr.value }
    case "NumberAST":
      return { type: "IntValue", value: expr.value }
    case "IdentifierAST":
      let result: Value | undefined = env.get(expr.value)
      if (result === undefined) {
        throw new Error(`Undefined variable ${expr.value} during evaluation`)
      }
      return result
    case "FunctionAST":
      // create a closure
      return {
        type: "FunctionClosure",
        pat: expr.pattern,
        body: expr.body,
        env: env
      }
    case "ApplicationAST":
      // evaluate the left and right sides of the application
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      // the left side should be a function
      if (left.type !== "FunctionClosure") {
        throw new Error("Left side of application is not a function")
      }
      // create a new environment with the pattern and right side of the application
      const newEnv: Maybe<Env> = bindPat(left.pat, right, left.env)
      if (isNone(newEnv)) {
        // this should not happen
        throw new Error("Pattern match failed")
      }

      // evaluate the body of the function in the new environment
      return evalExpr(left.body, newEnv.value)

    case "BooleanAST":
      return { type: "BoolValue", value: expr.value }
    case "IfAST":
      const condition: Value = evalExpr(expr.condition, env)
      if (condition.type !== "BoolValue") {
        throw new Error("Condition in if statement is not a boolean")
      }
      if (condition.value) return evalExpr(expr.thenBranch, env)
      else return evalExpr(expr.elseBranch, env)

    case "UnitAST":
      return { type: "UnitValue" }
    case "PlusAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "IntValue" || right.type !== "IntValue") {
        throw new Error("Operands to + are not integers")
      }
      return { type: "IntValue", value: left.value + right.value }
    
    case "MinusAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "IntValue" || right.type !== "IntValue") {
        throw new Error("Operands to - are not integers")
      }
      return { type: "IntValue", value: left.value - right.value }

    case "TimesAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "IntValue" || right.type !== "IntValue") {
        throw new Error("Operands to * are not integers")
      }
      return { type: "IntValue", value: left.value * right.value }
    
    case "DivideAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "IntValue" || right.type !== "IntValue") {
        throw new Error("Operands to / are not integers")
      }
      return { type: "IntValue", value: left.value / right.value }
      
    case "ConjunctionAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "BoolValue" || right.type !== "BoolValue") {
        throw new Error("Operands to && are not booleans")
      }
      return { type: "BoolValue", value: left.value && right.value }

    case "DisjunctionAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "BoolValue" || right.type !== "BoolValue") {
        throw new Error("Operands to || are not booleans")
      }
      return { type: "BoolValue", value: left.value || right.value }

    case "NilAST":
      return { type: "NilValue" }
    
    case "ConsAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      return { type: "ConsValue", head: left, tail: right }

    case "RelAST":
      left = evalExpr(expr.left, env)
      right = evalExpr(expr.right, env)
      if (left.type !== "IntValue" || right.type !== "IntValue") {
        throw new Error("Operands to a relational operator are not integers")
      }
      switch (expr.operator) {
        case "<":
          return { type: "BoolValue", value: left.value < right.value }
        case "<=":
          return { type: "BoolValue", value: left.value <= right.value }
        case ">":
          return { type: "BoolValue", value: left.value > right.value }
        case ">=":
          return { type: "BoolValue", value: left.value >= right.value }
        case "==":
          return { type: "BoolValue", value: left.value === right.value }
        case "!=":
          return { type: "BoolValue", value: left.value !== right.value }
        default:
          throw new Error("Unknown relational operator in evalExpr")
      }

    case "MatchAST":
      // evaluate the thing we are matching against
      const matchedValue: Value = evalExpr(expr.expr, env)
      // go through each case in the match
      for (const matchCase of expr.cases) {
        // attempt to bind the value with the pattern
        const [pat, body] = matchCase
        const newEnvMaybe: Maybe<Env> = bindPat(pat, matchedValue, env)

        if (isNone(newEnvMaybe)) continue

        // if the pattern matches, evaluate the body of the case in the new environment

        return evalExpr(body, newEnvMaybe.value)

      }

      throw new Error("Pattern match failed in match expression in evalExpr")

    case "BlockAST":
      let tempEnv: Env = env
      for (let i = 0; i < expr.statements.length - 1; i++) {
        const statement = expr.statements[i]
        if (statement.type === "DefnAST") {
          tempEnv = evalDefn(statement, tempEnv)
        }
        else {
          evalExpr(statement, tempEnv)
        }
      }
      
      const lastStatement = expr.statements[expr.statements.length - 1]
      if (lastStatement.type === "DefnAST") {
        throw new Error("Last statement in block is a definition in evalExpr, this should not happen")
      }
      else {
        return evalExpr(lastStatement, tempEnv)
      }

  }

}

export {
  evalExpr,
  evalDefn
}
