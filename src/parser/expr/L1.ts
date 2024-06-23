import { L1Factor } from "../../AST/expr/L1"
import { L9Expr } from "../../AST/expr/L9"
import { Maybe, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { disjunctionParser } from "./L7"
import { exprParser } from "./L9"

var numberParser: Parser<L1Factor> = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'NumberToken') {
    const numberNode: L1Factor = {
      type: 'NumberNode',
      value: input[0].value
    }
    return {
      type: 'Some',
      value: [numberNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

export var stringParser: Parser<L1Factor> = (input: Token[]) => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'StringToken') {
    const StringNode: L1Factor = {
      type: 'StringNode',
      value: input[0].value,
    }
    return {
      type: 'Some',
      value: [StringNode, input.slice(1)]
    }
  }
  else return { type: 'None' }
}

var booleanParser: Parser<L1Factor> =
  (input: Token[]): Maybe<[L1Factor, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type === 'BooleanToken') {
      const booleanNode: L1Factor = {
        type: 'BooleanNode',
        value: input[0].value
      }
      return {
        type: 'Some',
        value: [booleanNode, input.slice(1)]
      }
    }
    else return { type: 'None' }
  }

var identifierParser: Parser<L1Factor> = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'IdentifierToken') return { type: 'None' }

  const identifierNode: L1Factor = {
    type: 'IdentifierNode',
    value: input[0].value
  }

  return some([identifierNode, input.slice(1)])

}

var nilParser: Parser<L1Factor> = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'NilToken') return { type: 'None' }

  const nilNode: L1Factor = {
    type: 'NilNode'
  }

  return some([nilNode, input.slice(1)])
}

var parenFactorParser: Parser<L1Factor> = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'LParen') return { type: 'None' }

  let rest = input.slice(1)
  const result: Maybe<[L9Expr, Token[]]> = exprParser(rest)
  if (result.type === 'None') {
    return { type: 'None' }
  }

  const node = result.value[0]
  rest = result.value[1]

  if (rest.length === 0 || rest[0].type !== 'RParen') {
    return { type: 'None' }
  }

  return some([{
    type: 'ParenFactorNode',
    node: node
  }, rest.slice(1)])

}

export var factorParser = combineParsers([numberParser, stringParser, booleanParser, identifierParser, nilParser, parenFactorParser])