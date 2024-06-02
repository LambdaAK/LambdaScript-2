import { Maybe, none, some } from "./maybe"
import { lex } from "./Lexer"
import { appParser, arithParser, conjunctionParser, consParser, disjunctionParser, factorParser, patL1Parser, patL2Parser, relParser, termParser } from "./Parser"
import { ArithNode, stringOfNode } from "./AST"

const s: string = "1111"

const tokens = lex(s)

const nodeMaybe = patL2Parser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
}
else {
  const node = nodeMaybe.value[0]
  console.dir(node, { depth: null })
  //console.log(stringOfNode(node))
}

export const lexAndParse = (s: string): Maybe<ArithNode> => {
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