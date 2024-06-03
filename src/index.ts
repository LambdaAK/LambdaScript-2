import { Maybe, none, some } from "./util/maybe"
import { lex } from "./lexer/Lexer"

import { L9Expr } from "./AST/expr/L9"
import { arithParser } from "./parser/expr/L4"
import { exprParser } from "./parser/expr/L9"

const s: string = "fn x -> fn y -> x + y"

const tokens = lex(s)

const nodeMaybe = exprParser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
}

else {
  const node = nodeMaybe.value[0]
  console.dir(node, { depth: null })
  //console.log(stringOfNode(node))
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