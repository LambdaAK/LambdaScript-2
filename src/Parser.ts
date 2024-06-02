
// parser combinators

import { AddOperatorType, BinaryOperatorType, ConjunctionOperatorType, ConsOperatorType, DisjunctionOperatorType, MultiplyOperatorType, RelationalOperatorType, Token } from "./token";
import { Maybe, none, some } from "./maybe";
import { ApplicationNode, AppNode, ArithNode, BooleanNode, ConjunctionLevel, ConsLevel, DisjunctionLevel, DivideNode, ExprLevel, FactorNode, MinusNode, NumberNode, PatL1, PatL2, PlusNode, RelLevel, StringNode, TermNode, TimesNode, TypeL1, TypeL2 } from "./AST";

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

const nilParser: Parser<FactorNode> = (input: Token[]): Maybe<[FactorNode, Token[]]> => {
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'NilToken') return { type: 'None' }

  const nilNode: FactorNode = {
    type: 'NilNode'
  }

  return some([nilNode, input.slice(1)])
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

export const factorParser = combineParsers([numberParser, stringParser, booleanParser, identifierParser, nilParser, parenFactorParser])

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

export const consParser: Parser<ConsLevel> = (input: Token[]): Maybe<[ConsLevel, Token[]]> => {
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
    // parse a ConsLevel and make a ConsNode
    const result2 = consParser(tokensAfterCons)
    if (result2.type === 'None') {
      return none()
    }
    const [consLevel, rest2] = result2.value
    const consNode: ConsLevel = {
      type: 'ConsNode',
      left: disjunction,
      right: consLevel
    }

    return some([consNode, rest2])
  }
  else {
    // since the next token is an operator, but not a cons operator, do not continue parsing
    return some([disjunction, rest])
  }
}

const FunctionParser: Parser<ExprLevel> = (input: Token[]): Maybe<[ExprLevel, Token[]]> => {
  // the first token should be Fn
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'FnToken') return { type: 'None' }
  const tokensAfterFn = input.slice(1)
  // parse a PatL1
  const resultPat = patL1Parser(tokensAfterFn)
  if (resultPat.type === 'None') {
    return { type: 'None' }
  }
  const [pat, rest] = resultPat.value
  // the next token should be Arrow
  if (rest.length === 0) return { type: 'None' }
  if (rest[0].type !== 'RightArrow') return { type: 'None' }

  const tokensAfterArrow = rest.slice(1)

  // parse the body of the function, which is an ExprLevel

  const resultBody = exprParser(tokensAfterArrow)

  if (resultBody.type === 'None') {
    return { type: 'None' }
  }

  const [body, rest2] = resultBody.value

  const functionNode: ExprLevel = {
    type: 'FunctionNode',
    pattern: pat,
    body: body
  }

  return some([functionNode, rest2])
}

export const exprParser: Parser<ExprLevel> = combineParsers([FunctionParser, consParser])




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