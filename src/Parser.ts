
// parser combinators


import { BinaryOperatorType, Token } from "./token";
import { Maybe, some } from "./maybe";
import { ArithNode, BooleanNode, DivideNode, FactorNode, MinusNode, NumberNode, PlusNode, StringNode, TermNode, TimesNode } from "./AST";

type Parser<T> = (input: Token[]) => Maybe<[T, Token[]]>

const combine = <T>(p1: Parser<T>, p2: Parser<T>): Parser<T> => {
  const p3: Parser<T> = (input: Token[]) => {
    const result = p1(input)
    if (result.type === 'None') {
      return p2(input)
    }
    else {
      return result
    }
  }
  return p3
}

const combineParsers = <T>(parsers: Parser<T>[]): Parser<T> => {
  const combined = parsers.reduce((acc, parser) => {
    return combine(acc, parser)
  })
  return combined
}

const numberParser: Parser<FactorNode> = (input: Token[]): Maybe<[FactorNode, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'NumberToken') {
    const numberNode: NumberNode = {
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

export const stringParser: Parser<FactorNode> = (input: Token[]) => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type === 'StringToken') {
    const StringNode: StringNode = {
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

const booleanParser: Parser<FactorNode> =
  (input: Token[]): Maybe<[BooleanNode, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type === 'BooleanToken') {
      const booleanNode: BooleanNode = {
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

const identifierParser: Parser<FactorNode> = (input: Token[]): Maybe<[FactorNode, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'IdentifierToken') return { type: 'None' }

  const identifierNode: FactorNode = {
    type: 'IdentifierNode',
    value: input[0].value
  }

  return some([identifierNode, input.slice(1)])

}

const parenFactorParser: Parser<FactorNode> = (input: Token[]): Maybe<[FactorNode, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'LParen') return { type: 'None' }

  let rest = input.slice(1)
  const result = arithParser(rest)
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

export const factorParser = combineParsers([numberParser, stringParser, booleanParser, identifierParser, parenFactorParser])

export const termParser: Parser<TermNode> = (input: Token[]): Maybe<[TermNode, Token[]]> => {
  // parse a list of factors
  const factors: FactorNode[] = []
  const bops: BinaryOperatorType[] = []

  let rest = input
  // parse a list of factors
  while (true) {
    // parse a factor
    const result = factorParser(rest)
    if (result.type === 'None') {
      break
    }
    else {
      factors.push(result.value[0])
      rest = result.value[1]
    }

    // parse a times operator
    if (rest.length === 0) {
      break
    }
    if (rest[0].type === 'BopToken'
      && (rest[0].operator === BinaryOperatorType.Times
        || rest[0].operator === BinaryOperatorType.Divide)) {
      bops.push(rest[0].operator)
      rest = rest.slice(1)
    }
    else {
      break
    }
  }

  const combineFactors = (factors: FactorNode[], bops: BinaryOperatorType[]): TermNode => {
    // If there is only one factor, return it. It is a factor term
    if (factors.length === 1) {
      return factors[0]
    }
    // Otherwise, combine all factors other than the last one into a single term, and then combine that term with the last factor
    const allFactorsButLast = factors.slice(0, factors.length - 1)
    const lastFactor = factors[factors.length - 1]

    const allBopsButLast = bops.slice(0, bops.length - 1)
    const lastBop = bops[bops.length - 1]

    const left = combineFactors(allFactorsButLast, allBopsButLast)

    if (lastBop === BinaryOperatorType.Times) {
      const timesNode: TimesNode = {
        type: 'TimesNode',
        left: left,
        right: lastFactor
      }
      return timesNode

    }

    if (lastBop === BinaryOperatorType.Divide) {
      const divideNode: DivideNode = {
        type: 'DivideNode',
        left: left,
        right: lastFactor
      }
      return divideNode
    }

    throw new Error('Unreachable in combineFactors')

  }

  return {
    type: 'Some',
    value: [combineFactors(factors, bops), rest]
  }
}

export const arithParser: Parser<ArithNode> = (input: Token[]): Maybe<[ArithNode, Token[]]> => {
  // parse a list of terms
  const terms: TermNode[] = []
  const bops: BinaryOperatorType[] = []

  let rest = input

  while (true) {
    // parse a term
    const result = termParser(rest)
    if (result.type === 'None') {
      break
    }
    else {
      terms.push(result.value[0])
      rest = result.value[1]
    }

    if (rest.length === 0) {
      break
    }

    if (rest[0].type === 'BopToken' &&
      (rest[0].operator === BinaryOperatorType.Plus
        || rest[0].operator === BinaryOperatorType.Minus)) {
      bops.push(rest[0].operator)
      rest = rest.slice(1)
    }
    else {
      break
    }
  }

  const combineTerms = (terms: TermNode[], bops: BinaryOperatorType[]): ArithNode => {
    // If there is only one term, return it. It is a term arith
    if (terms.length === 1) {
      return terms[0]
    }
    // Otherwise, combine all terms other than the last one into a single arith, and then combine that arith with the last term
    const allTermsButLast = terms.slice(0, terms.length - 1)
    const lastTerm = terms[terms.length - 1]

    const allBopsButLast = bops.slice(0, bops.length - 1)
    const lastBop = bops[bops.length - 1]

    const left = combineTerms(allTermsButLast, allBopsButLast)

    if (lastBop === BinaryOperatorType.Plus) {
      const plusNode: PlusNode = {
        type: 'PlusNode',
        left: left,
        right: lastTerm
      }
      return plusNode
    }

    if (lastBop === BinaryOperatorType.Minus) {
      const minusNode: MinusNode = {
        type: 'MinusNode',
        left: left,
        right: lastTerm
      }
      return minusNode
    }

    throw new Error('Unreachable in combineTerms')
  }

  return {
    type: 'Some',
    value: [combineTerms(terms, bops), rest]
  }

}