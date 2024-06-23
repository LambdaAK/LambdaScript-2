import { Token } from "../../lexer/token";
import { Maybe, none, some } from "../../util/maybe";
import { combineParsers, Parser } from "../parser";
import { typeL3Parser } from "./TypeL3";

var polymorphicTypeParser: Parser<TypeL4> = (input: Token[]): Maybe<[TypeL4, Token[]]> => {
  // first token should be Fn
  if (input.length === 0) {
    return none()
  }
  if (input[0].type !== 'FNToken') {
    return none()
  }

  const tokensAfterFn = input.slice(1)

  // the next token should be an identifier (the argument to the polymorphic type)

  if (tokensAfterFn.length === 0) {
    return none()
  }

  if (tokensAfterFn[0].type !== 'IdentifierToken') {
    return none()
  }

  const argument = tokensAfterFn[0].value

  const tokensAfterIdentifier = tokensAfterFn.slice(1)

  // the next token should be an arrow

  if (tokensAfterIdentifier.length === 0) {
    return none()
  }

  if (tokensAfterIdentifier[0].type !== 'RightArrow') {
    return none()
  }

  const tokensAfterArrow = tokensAfterIdentifier.slice(1)

  // the body of the polymorphic type should be a TypeL3

  const result = typeL4Parser(tokensAfterArrow)

  if (result.type === 'None') {
    return none()
  }

  const [body, rest] = result.value

  const polymorphicType: TypeL4 = {
    type: 'PolymorphicType',
    input: argument,
    output: body
  }

  return some([polymorphicType, rest])
}

export var typeL4Parser = combineParsers([polymorphicTypeParser, typeL3Parser])