import { Maybe, none, some } from "./maybe"
import { lex } from "./Lexer"
import { appParser, arithParser, conjunctionParser, consParser, disjunctionParser, exprParser, factorParser, patL1Parser, patL2Parser, relParser, termParser, typeL1Parser, typeL2Parser } from "./Parser"
import { L9Expr } from "./AST/expr/L9"

const s: string = "((String -> Int) -> Bool)"

const tokens = lex(s)

const nodeMaybe = typeL2Parser(tokens)

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
  const nodeMaybe = arithParser(tokens)
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