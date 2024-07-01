import { isNone, Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { Expr, stringOfExpr } from "./AST/expr/expr"
import { stringOfType, Type } from "./AST/type/Type"
import { bindPat, fixType, generalizeTypeVars, typeOfExpr } from "./typecheck/typecheck"
import { condenseDefn, condenseExpr } from "./AST/condense"
import { DefnParser, L9ExprParser } from "./parser/parser"
import { compile, compileExpr } from "./compiler/compile"
import { DefnAST } from "./AST/defn/defn"
import { Env, Value } from "./evaluator/value"
import { evalDefn, evalExpr } from "./evaluator/eval"
import { ImmMap } from "./util/ImmMap"

export const lexAndParseExpr = (s: string): Expr => {
  const tokens = lex(s)
  const nodeMaybe = L9ExprParser.exprParser(tokens)
  if (isNone(nodeMaybe)) {
    throw new Error(`Failed to parse expression1: ${s}`)
  }
  // condense the AST
  return condenseExpr(nodeMaybe.value[0])
}

export const lexAndParseDefn = (s: string): DefnAST => {
  const tokens = lex(s)
  const nodeMaybe = DefnParser.defnParser(tokens)
  if (isNone(nodeMaybe)) {
    throw new Error(`Failed to parse definition: ${s}`)
  }
  return condenseDefn(nodeMaybe.value[0])
}

export const lexAndParseProgram = (s: string): DefnAST[] => {
  let tokens = lex(s)
  const defns: DefnAST[] = []

  while (true) {
    const nodeMaybe = DefnParser.defnParser(tokens)
    if (isNone(nodeMaybe)) break
    defns.push(condenseDefn(nodeMaybe.value[0]))
    tokens = nodeMaybe.value[1]
  }
  
  return defns

}

// repl

const repl = () => {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  let env: Env = new ImmMap<string, Value>([])
  let staticEnv = new ImmMap<string, Type>([])

  const repl = (input: string) => {
    
    try {
      const ast = lexAndParseExpr(input)
      const type = typeOfExpr(ast, staticEnv)
      console.log(stringOfType(fixType(generalizeTypeVars(type))))
      // evaluate it
      const result: Value = evalExpr(ast, env)
      console.log(result)
    }
    catch (e) {
      const ast = lexAndParseDefn(input)
      const resultingEnv: Env = evalDefn(ast, env)
      console.log("resultingEnv")
      console.dir(resultingEnv, {depth: null})
      const resultingStaticEnv: ImmMap<string, Type> = bindPat(ast.pat, typeOfExpr(ast.body, staticEnv), staticEnv)
      console.log("resultingStaticEnv")
      console.dir(resultingStaticEnv, {depth: null})
      
      env = resultingEnv
      staticEnv = resultingStaticEnv
      console.log("()")
    }
    
  }

  rl.on('line', (input: string) => {
    repl(input)
  })
}

repl()


