import { L8Cons } from "../../AST/expr/L8"
import { Maybe, none, some } from "../../util/maybe"
import { Token, ConsOperatorType } from "../../lexer/token"
import { Parser } from "../parser"
import { disjunctionParser } from "./L7"

export var consParser: Parser<L8Cons> = (input: Token[]): Maybe<[L8Cons, Token[]]> => {
  // parse a disjunction
  const result = disjunctionParser(input)
  if (result.type === 'None') {
    return none()
  }
  const [disjunction, rest] = result.value
  // check if the next token is a cons operator
  if (rest.length === 0) {
    return some([disjunction, rest])
  }
  if (rest[0].type === 'BopToken' && rest[0].operator === ConsOperatorType.Cons) {
    const tokensAfterCons = rest.slice(1)
    // parse a L8Cons and make a ConsNode
    const result2 = consParser(tokensAfterCons)
    if (result2.type === 'None') {
      return none()
    }
    const [L8Cons, rest2] = result2.value
    const consNode: L8Cons = {
      type: 'ConsNode',
      left: disjunction,
      right: L8Cons
    }

    return some([consNode, rest2])
  }
  else {
    // since the next token is an operator, but not a cons operator, do not continue parsing
    return some([disjunction, rest])
  }
}