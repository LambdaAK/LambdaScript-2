import { Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { exprParser } from "./parser/expr/L9"
import { defnParser } from "./parser/defn/defnParser"
import { condenseDefn } from "./AST/defn/condenseDefn"
import { condenseExpr } from "./AST/expr/condenseExpr"
import { generate, unify, getType, objectsEqual } from "./typecheck/typecheck"
import { ImmMap } from "./util/ImmMap"

const s: string = `{
  const f = fn x -> x;
  1 + 1;
}`


const tokens = lex(s)

const nodeMaybe = exprParser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
  while (true) { }
}

const ast = condenseExpr(nodeMaybe.value[0])

console.dir(ast, { depth: null })


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