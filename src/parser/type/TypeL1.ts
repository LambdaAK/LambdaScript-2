import { Maybe, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { typeL2Parser } from "./TypeL2"

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
  const result: Maybe<[TypeL2, Token[]]> = typeL2Parser(rest)
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

export const typeL1Parser = combineParsers([unitTypeParser, boolTypeParser, stringTypeParser, intTypeParser, parenTypeParser])