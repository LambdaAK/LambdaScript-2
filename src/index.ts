import { Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { exprParser } from "./parser/expr/L9"
import { typeL4Parser } from "./parser/type/TypeL4"
import { typeL1Parser } from "./parser/type/TypeL1"
import { generate } from "./typecheck/typecheck"

const s: string = ""

const tokens = lex(s)

const nodeMaybe = exprParser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
}

else {
  const node = nodeMaybe.value[0]
  console.dir(node, { depth: null })
  //console.log(stringOfNode(node))
  const [t, equations] = generate(node, new Map())
  console.log(t)
  console.log(equations)
}

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