
// parser combinators


import { AddOperatorType, BinaryOperatorType, ConjunctionOperatorType, DisjunctionOperatorType, MultiplyOperatorType, RelationalOperatorType, Token } from "./token";
import { Maybe, none, some } from "./maybe";
import { ApplicationNode, AppNode, ArithNode, BooleanNode, ConjunctionLevel, DisjunctionLevel, DivideNode, FactorNode, MinusNode, NumberNode, PlusNode, RelLevel, StringNode, TermNode, TimesNode } from "./AST";

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
  const result: Maybe<[DisjunctionLevel, Token[]]> = disjunctionParser(rest)
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

export const appParser: Parser<AppNode> = (input: Token[]): Maybe<[AppNode, Token[]]> => {
  // parse a list of factors while possible
  // then, fold them an application
  // application is left associative
  const factors: FactorNode[] = []
  let rest: Token[] = input
  while (true) {
    const result = factorParser(rest)
    if (result.type == "None") {
      break
    }
    const [newFactor, restTokens] = result.value
    factors.push(newFactor)
    rest = restTokens
  }


  const combineFactorsIntoApp = (factors: FactorNode[]): AppNode => {

    // a b c === (a b) c

    // take off the last one
    if (factors.length == 1) return factors[0]

    const allFactorsButLast = factors.slice(0, factors.length - 1)
    const right = factors[factors.length - 1]

    const left = combineFactorsIntoApp(allFactorsButLast)

    const newApp: ApplicationNode = {
      type: "ApplicationNode",
      left: left,
      right: right
    }

    return newApp

  }

  // fold the factors into an AppNode

  if (factors.length === 0) return none()

  const appNode: AppNode = combineFactorsIntoApp(factors)

  return some([appNode, rest])

}

export const termParser: Parser<TermNode> = (input: Token[]): Maybe<[TermNode, Token[]]> => {
  // parse a list of factors
  const factors: AppNode[] = []
  const bops: BinaryOperatorType[] = []

  let rest = input
  // parse a list of factors
  while (true) {
    // parse a factor
    const result = appParser(rest)
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
      && (rest[0].operator === MultiplyOperatorType.Times
        || rest[0].operator === MultiplyOperatorType.Divide)) {
      bops.push(rest[0].operator)
      rest = rest.slice(1)
    }
    else {
      break
    }
  }

  const combineFactors = (factors: AppNode[], bops: BinaryOperatorType[]): TermNode => {
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

    if (lastBop === MultiplyOperatorType.Times) {
      const timesNode: TimesNode = {
        type: 'TimesNode',
        left: left,
        right: lastFactor
      }
      return timesNode

    }

    if (lastBop === MultiplyOperatorType.Divide) {
      const divideNode: DivideNode = {
        type: 'DivideNode',
        left: left,
        right: lastFactor
      }
      return divideNode
    }

    throw new Error('Unreachable in combineFactors')

  }

  if (factors.length === 0) return none()

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
      (rest[0].operator === AddOperatorType.Plus
        || rest[0].operator === AddOperatorType.Minus)) {
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

    if (lastBop === AddOperatorType.Plus) {
      const plusNode: PlusNode = {
        type: 'PlusNode',
        left: left,
        right: lastTerm
      }
      return plusNode
    }

    if (lastBop === AddOperatorType.Minus) {
      const minusNode: MinusNode = {
        type: 'MinusNode',
        left: left,
        right: lastTerm
      }
      return minusNode
    }

    throw new Error('Unreachable in combineTerms')
  }

  if (terms.length === 0) return none()

  return {
    type: 'Some',
    value: [combineTerms(terms, bops), rest]
  }

}

export const relParser = (input: Token[]): Maybe<[RelLevel, Token[]]> => {

  const ariths: ArithNode[] = []
  const bops: RelationalOperatorType[] = []

  let rest = input


  while (true) {
    const result = arithParser(rest)
    if (result.type === 'None') {
      break
    }
    else {
      ariths.push(result.value[0])
      rest = result.value[1]
    }

    if (rest.length === 0) {
      break
    }

    if (rest[0].type === 'BopToken' &&
      (rest[0].operator === RelationalOperatorType.LessThan
        || rest[0].operator === RelationalOperatorType.GreaterThan
        || rest[0].operator === RelationalOperatorType.LessThanEqual
        || rest[0].operator === RelationalOperatorType.GreaterThanEqual
        || rest[0].operator === RelationalOperatorType.Equal
        || rest[0].operator === RelationalOperatorType.NotEqual)) {
      bops.push(rest[0].operator)
      rest = rest.slice(1)
    }
    else {
      break
    }
  }

  const combineAriths = (ariths: ArithNode[], bops: RelationalOperatorType[]): RelLevel => {
    if (ariths.length === 1) {
      return ariths[0]
    }

    const allArithsButLast = ariths.slice(0, ariths.length - 1)
    const lastArith = ariths[ariths.length - 1]

    const allBopsButLast = bops.slice(0, bops.length - 1)
    const lastBop = bops[bops.length - 1]

    const left = combineAriths(allArithsButLast, allBopsButLast)

    const relNode: RelLevel = {
      type: 'RelNode',
      left: left,
      right: lastArith,
      operator: lastBop
    }

    return relNode
  }

  if (ariths.length === 0) return none()

  return some([combineAriths(ariths, bops), rest])

}

export const conjunctionParser: Parser<ConjunctionLevel> = (input: Token[]): Maybe<[ConjunctionLevel, Token[]]> => {
  const rels: RelLevel[] = []

  let rest = input

  while (true) {
    const result = relParser(rest)
    if (result.type === "None") {
      break
    }
    else {
      rels.push(result.value[0])
      rest = result.value[1]
    }

    if (rest.length === 0) {
      break
    }

    // parse a conjunction operator

    if (rest[0].type === 'BopToken' && rest[0].operator === ConjunctionOperatorType.And) {
      rest = rest.slice(1)
    }
    else {
      break
    }
  }

  const combineRels = (rels: RelLevel[]): ConjunctionLevel => {
    if (rels.length === 1) {
      return rels[0]
    }

    const allRelsButLast = rels.slice(0, rels.length - 1)
    const lastRel = rels[rels.length - 1]

    const left: ConjunctionLevel = combineRels(allRelsButLast)

    const conjunctionNode: ConjunctionLevel = {
      type: 'ConjunctionNode',
      left: left,
      right: lastRel
    }

    return conjunctionNode
  }

  if (rels.length === 0) return none()

  return some([combineRels(rels), rest])
}

export const disjunctionParser: Parser<DisjunctionLevel> = (input: Token[]): Maybe<[DisjunctionLevel, Token[]]> => {
  const conjunctions: ConjunctionLevel[] = []

  let rest = input

  while (true) {
    const result = conjunctionParser(rest)




    if (result.type === 'None') {
      break
    }
    else {
      conjunctions.push(result.value[0])
      rest = result.value[1]
    }

    if (rest.length === 0) {
      break
    }

    if (rest[0].type === 'BopToken' && rest[0].operator === DisjunctionOperatorType.Or) {
      rest = rest.slice(1)
    }
    else {
      break
    }
  }

  const combineConjunctions = (conjunctions: ConjunctionLevel[]): DisjunctionLevel => {
    if (conjunctions.length === 1) {
      return conjunctions[0]
    }

    const allConjunctionsButLast = conjunctions.slice(0, conjunctions.length - 1)
    const lastConjunction = conjunctions[conjunctions.length - 1]

    const left = combineConjunctions(allConjunctionsButLast)

    const disjunctionNode: DisjunctionLevel = {
      type: 'DisjunctionNode',
      left: left,
      right: lastConjunction
    }

    return disjunctionNode
  }

  if (conjunctions.length === 0) return none()

  return some([combineConjunctions(conjunctions), rest])
}
