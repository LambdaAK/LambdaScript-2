import { Maybe, none, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { typeL4Parser } from "./TypeL4"
import { typeL3Parser } from "./TypeL3"

const unitTypeParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'UnitTypeToken') return { type: 'None' }
  return some([{
    type: 'UnitType'
  }, input.slice(1)])
}

const boolTypeParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'BoolTypeToken') return { type: 'None' }
  return some([{
    type: 'BoolType'
  }, input.slice(1)])
}

const stringTypeParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'StringTypeToken') return { type: 'None' }
  return some([{
    type: 'StringType'
  }, input.slice(1)])
}

const intTypeParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'IntTypeToken') return { type: 'None' }
  return some([{
    type: 'IntType'
  }, input.slice(1)])
}

const parenTypeParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'LParen') return { type: 'None' }

  let rest = input.slice(1)
  const result: Maybe<[TypeL4, Token[]]> = typeL4Parser(rest)
  if (result.type === 'None') {
    return { type: 'None' }
  }

  const node = result.value[0]
  rest = result.value[1]

  if (rest.length === 0 || rest[0].type !== 'RParen') {
    return { type: 'None' }
  }

  const parenNode: TypeL1 = {
    type: 'ParenType',
    t: node
  }

  return some([parenNode, rest.slice(1) /* Remove the RParen */])

}

const listTypeParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return none()
  if (input[0].type !== 'LBracket') return none()
  const rest = input.slice(1)
  const insideTypeResult = typeL3Parser(rest)
  if (insideTypeResult.type === 'None') return none()
  const [insideType, rest2] = insideTypeResult.value
  if (rest2.length === 0 || rest2[0].type !== 'RBracket') return none()

  const newType: TypeL1 = {
    type: 'ListType',
    t: insideType
  }

  return some([newType, rest2.slice(1)])
}

const typeVarParser: Parser<TypeL1> = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'IdentifierToken') return { type: 'None' }
  return some([{
    type: 'TypeVar',
    name: input[0].value
  }, input.slice(1)])

}

export const typeL1Parser = combineParsers([listTypeParser, unitTypeParser, boolTypeParser, stringTypeParser, intTypeParser, parenTypeParser, typeVarParser])