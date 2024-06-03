import { L2App } from "../../AST/expr/L2"
import { L3Term } from "../../AST/expr/L3"
import { Maybe, none } from "../../util/maybe"
import { Token, BinaryOperatorType, MultiplyOperatorType } from "../../lexer/token"
import { Parser } from "../parser"
import { appParser } from "./L2"

export const termParser: Parser<L3Term> = (input: Token[]): Maybe<[L3Term, Token[]]> => {
  // parse a list of factors
  const factors: L2App[] = []
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

  const combineFactors = (factors: L2App[], bops: BinaryOperatorType[]): L3Term => {
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
      const timesNode: L3Term = {
        type: 'TimesNode',
        left: left,
        right: lastFactor
      }
      return timesNode

    }

    if (lastBop === MultiplyOperatorType.Divide) {
      const divideNode: L3Term = {
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