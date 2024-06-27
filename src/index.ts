import { isNone, Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { Expr, stringOfExpr } from "./AST/expr/expr"
import { stringOfType } from "./AST/type/Type"
import { fixType, generalizeTypeVars, typeOfExpr } from "./typecheck/typecheck"
import { condenseExpr } from "./AST/condense"
import { L9ExprParser } from "./parser/parser"

export const lexAndParseExpr = (s: string): Expr => {
  const tokens = lex(s)
  const nodeMaybe = L9ExprParser.exprParser(tokens)
  if (isNone(nodeMaybe)) {
    throw new Error(`Failed to parse expression1: ${s}`)
  }
  // condense the AST
  return condenseExpr(nodeMaybe.value[0])
}

// repl

const repl = () => {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const repl = (input: string) => {
    const ast = lexAndParseExpr(input)
    console.dir(ast, {depth: null})
    const type = typeOfExpr(ast)
    console.log(stringOfType(fixType(generalizeTypeVars(type))))
  }

  rl.on('line', (input: string) => {
    repl(input)
  })
}

repl()
