import { Maybe, none, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { typeL1Parser } from "./TypeL1"

const functionTypeParser: Parser<TypeL2> = (input: Token[]): Maybe<[TypeL2, Token[]]> => {
  // pl1 -> pl2
  // parse a TypeL1
  const result1 = typeL1Parser(input)
  if (result1.type === 'None') {
    return none()
  }
  const [left, rest] = result1.value
  // the next token should be an arrow
  if (rest.length === 0) {
    return none()
  }
  if (rest[0].type !== 'RightArrow') {
    return none()
  }
  // parse a TypeL2
  const result2 = typeL2Parser(rest.slice(1))
  if (result2.type === 'None') {
    return none()
  }
  const [right, rest2] = result2.value
  // make a FunctionType
  const functionType: TypeL2 = {
    type: 'FunctionType',
    left: left,
    right: right
  }
  return some([functionType, rest2])
}

export const typeL2Parser = combineParsers([functionTypeParser, typeL1Parser])