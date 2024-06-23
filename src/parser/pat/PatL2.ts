import { PatL2 } from "../../AST/pat/PatL2"
import { Maybe, none, some } from "../../util/maybe"
import { Token, ConsOperatorType } from "../../lexer/token"
import { combineParsers } from "../parser"


const consPatParser = (input: Token[]): Maybe<[PatL2, Token[]]> => {
  // parse a PatL1
  const result = patL1Parser(input)
  if (result.type === 'None') {
    return none()
  }
  const [left, rest] = result.value
  // check if the next token is a cons operator
  if (rest.length === 0) {
    return some([left, rest])
  }

  if (rest[0].type === 'BopToken' && rest[0].operator === ConsOperatorType.Cons) {
    const tokensAfterCons = rest.slice(1)
    // parse a PatL2
    const result2 = patL2Parser(tokensAfterCons)
    if (result2.type === 'None') {
      return none()
    }
    const [right, rest2] = result2.value
    // make a ConsPat
    const consNode: PatL2 = {
      type: 'ConsPat',
      left: left,
      right: right
    }
    return some([consNode, rest2])
  }
  else {
    // the next token is not a cons operator, so just return the PatL1
    return some([left, rest])
  }
}

export const patL2Parser = combineParsers([consPatParser, patL1Parser])