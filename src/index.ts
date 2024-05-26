import { Maybe, none, some } from "./maybe"
import { lex } from "./Lexer"
import { appParser, arithParser, factorParser, termParser } from "./Parser"
import { ArithNode } from "./AST"

const s: string = "1 * 2 + b c * 2"

const tokens = lex(s)

const nodeMaybe = arithParser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
}
else {
  const node = nodeMaybe.value[0]
  console.dir(node, { depth: null })
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