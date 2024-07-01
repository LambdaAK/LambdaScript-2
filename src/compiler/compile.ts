import { DefnAST } from "../AST/defn/defn"
import { Expr } from "../AST/expr/expr"
import { Pat } from "../AST/pat/Pat"
import { Type } from "../AST/type/Type"

const compilePattern = (pattern: Pat): string => {
  switch (pattern.type) {
    case "IdPatAST":
      return pattern.value
    default:
      throw new Error("Compile pattern unimplemented")
  }
}

const compileType = (type: Type): string => {
  throw new Error('Not implemented')
}

export const compileExpr = (expr: Expr): string => {
  switch (expr.type) {
    case "StringAST":
      return `"${expr.value}"`
    case "NumberAST":
      return expr.value.toString()
    case "IdentifierAST":
      return expr.value
    case "FunctionAST":
      // don't include the type annotation in the argument
      const compiledPattern: string = compilePattern(expr.pattern)
      const compiledBody: string = compileExpr(expr.body)
      return `(${compiledPattern}) => ${compiledBody}`

    case "ApplicationAST":
      const compiledLeft: string = compileExpr(expr.left)
      const compiledRight: string = compileExpr(expr.right)
      return `${compiledLeft}(${compiledRight})`
    case "BooleanAST":
      if (expr.value) return "true"
      else return "false"
    case "IfAST":
      const compiledCondition: string = compileExpr(expr.condition)
      const compiledThen: string = compileExpr(expr.thenBranch)
      const compiledElse: string = compileExpr(expr.elseBranch)

      return `(${compiledCondition}) ? (${compiledThen}) : (${compiledElse})`

    case "UnitAST":
      return "null"
    
    case "PlusAST":
      const compiledLeftPlus: string = compileExpr(expr.left)
      const compiledRightPlus: string = compileExpr(expr.right)
      return `(${compiledLeftPlus} + ${compiledRightPlus})`

    case "MinusAST":
      const compiledLeftMinus: string = compileExpr(expr.left)
      const compiledRightMinus: string = compileExpr(expr.right)
      return `(${compiledLeftMinus} - ${compiledRightMinus})`

    case "TimesAST":
      const compiledLeftTimes: string = compileExpr(expr.left)
      const compiledRightTimes: string = compileExpr(expr.right)
      return `(${compiledLeftTimes} * ${compiledRightTimes})`
    
    case "DivideAST":
      const compiledLeftDivide: string = compileExpr(expr.left)
      const compiledRightDivide: string = compileExpr(expr.right)
      return `(${compiledLeftDivide} / ${compiledRightDivide})`

    case "RelAST":
      const compiledLeftRel: string = compileExpr(expr.left)
      const compiledRightRel: string = compileExpr(expr.right)
      return `(${compiledLeftRel} ${expr.operator} ${compiledRightRel})`

    case "ConjunctionAST":
      const compiledLeftConjunction: string = compileExpr(expr.left)
      const compiledRightConjunction: string = compileExpr(expr.right)
      return `(${compiledLeftConjunction} && ${compiledRightConjunction})`

    case "DisjunctionAST":
      const compiledLeftDisjunction: string = compileExpr(expr.left)
      const compiledRightDisjunction: string = compileExpr(expr.right)
      return `(${compiledLeftDisjunction} || ${compiledRightDisjunction})`

    case "NilAST":
      return "[]"

    case "ConsAST":
      const compiledLeftCons: string = compileExpr(expr.left)
      const compiledRightCons: string = compileExpr(expr.right)
      return `[${compiledLeftCons}, ...${compiledRightCons}]`

    default:
      throw new Error("Compile unimplemented")
  }
}

const compileDefn = (defn: DefnAST): string => {
  const compiledBody = compileExpr(defn.body)
  const compiledPat = compilePattern(defn.pat)
  return `const ${compiledPat} = ${compiledBody}`
}

export const compile = (defns: DefnAST[]): string => {
  throw new Error('Not implemented')
}