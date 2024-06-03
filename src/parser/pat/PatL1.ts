import { PatL1 } from "../../AST/pat/PatL1"
import { PatL2 } from "../../AST/pat/PatL2"
import { Maybe, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { combineParsers } from "../parser"
import { patL2Parser } from "./PatL2"

const nilPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'NilToken') {
    const nilNode: PatL1 = {
      type: 'NilPat'
    }
    return {
      type: 'Some',
      value: [nilNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const boolPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'BooleanToken') {
    const booleanNode: PatL1 = {
      type: 'BoolPat',
      value: input[0].value
    }
    return {
      type: 'Some',
      value: [booleanNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const stringPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'StringToken') {
    const stringNode: PatL1 = {
      type: 'StringPat',
      value: input[0].value
    }
    return {
      type: 'Some',
      value: [stringNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const intPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'NumberToken') {
    const numberNode: PatL1 = {
      type: 'IntPat',
      value: input[0].value
    }
    return {
      type: 'Some',
      value: [numberNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const wildcardPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'Wildcard') {
    const wildcardNode: PatL1 = {
      type: 'WildcardPat'
    }
    return {
      type: 'Some',
      value: [wildcardNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const unitPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'UnitToken') {
    const unitNode: PatL1 = {
      type: 'UnitPat'
    }
    return {
      type: 'Some',
      value: [unitNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const idPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'IdentifierToken') {
    const idNode: PatL1 = {
      type: 'IdPat',
      value: input[0].value
    }
    return {
      type: 'Some',
      value: [idNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

const parenPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'LParen') return { type: 'None' }

  let rest = input.slice(1)
  const result: Maybe<[PatL2, Token[]]> = patL2Parser(rest)
  if (result.type === 'None') {
    return { type: 'None' }
  }

  const node = result.value[0]
  rest = result.value[1]

  if (rest.length === 0 || rest[0].type !== 'RParen') {
    return { type: 'None' }
  }

  return some([{
    type: 'ParenPat',
    node: node
  }, rest.slice(1)])

}

export const patL1Parser = combineParsers([nilPatParser, boolPatParser, stringPatParser, intPatParser, wildcardPatParser, unitPatParser, idPatParser, parenPatParser])