import { L3Term } from "../../AST/expr/L3"
import { L4Arith } from "../../AST/expr/L4"
import { Maybe, none } from "../../util/maybe"
import { Token, BinaryOperatorType, AddOperatorType } from "../../lexer/token"
import { Parser } from "../parser"
import { termParser } from "./L3"

export const arithParser: Parser<L4Arith> = (input: Token[]): Maybe<[L4Arith, Token[]]> => {
  // parse a list of terms
  const terms: L3Term[] = []
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

  const combineTerms = (terms: L3Term[], bops: BinaryOperatorType[]): L4Arith => {
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
      const plusNode: L4Arith = {
        type: 'PlusNode',
        left: left,
        right: lastTerm
      }
      return plusNode
    }

    if (lastBop === AddOperatorType.Minus) {
      const minusNode: L4Arith = {
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