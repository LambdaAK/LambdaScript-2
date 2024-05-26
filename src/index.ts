import { Maybe, none, some } from "./maybe"
import { lex } from "./Lexer"
import { arithParser, factorParser, termParser } from "./Parser"
import { stringOfArithNode } from "./AST"

const s: string = "1 + 2 * 3 + 1"

const tokens = lex(s)

const nodeMaybe = arithParser(tokens)

if (nodeMaybe.type === 'None') {
  console.log('parse error')
}
else {
  const node = nodeMaybe.value[0]
  console.log(stringOfArithNode(node))
}

