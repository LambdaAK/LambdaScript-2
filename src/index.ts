import { Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { exprParser } from "./parser/expr/L9"
import { typeL4Parser } from "./parser/type/TypeL4"
import { typeL1Parser } from "./parser/type/TypeL1"
import { generate, getType, substituteTypeVars, unify } from "./typecheck/typecheck"
import { ImmMap } from "./util/ImmMap"
import { condenseExpr } from "./AST/expr/condenseExpr"
import { condenseType } from "./AST/type/condenseType"
import { defnParser } from "./parser/defn/defnParser"
import { condenseDefn } from "./AST/defn/condenseDefn"

const s: string = "var x : Int = 5"

const tokens = lex(s)

const nodeMaybe = defnParser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
  while (true) { }
}

const ast = condenseDefn(nodeMaybe.value[0])

console.dir(ast, { depth: null })

/*
console.log("\n\n\n\n\n\n\n\n")

console.log(ast)

const node = nodeMaybe.value[0]
console.dir(node, { depth: null })
//console.log(stringOfNode(node))
const [t, equations] = generate(ast, new ImmMap([]))
console.log("Type:")
console.dir(t, { depth: null })
console.log("Equations:")
console.dir(equations, { depth: null })
console.log("Unifying...")
const unified = unify(equations)
console.log("Unified:")
console.dir(unified, { depth: null })
console.log("Substituting...")
console.dir(getType(t, unified), { depth: null })
*/

export const lexAndParse = (s: string): Maybe<L9Expr> => {
  const tokens = lex(s)
  const nodeMaybe = exprParser(tokens)
  if (nodeMaybe.type === 'None') {
    return {
      type: 'None'
    }
  }
  else {
    const node = nodeMaybe.value[0]
    return {
      type: 'Some',
      value: node
    }
  }
}