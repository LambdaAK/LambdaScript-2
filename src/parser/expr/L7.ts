import { L6Conjunction } from "../../AST/expr/L6"
import { L7Disjunction } from "../../AST/expr/L7"
import { Maybe, none, some } from "../../util/maybe"
import { Token, DisjunctionOperatorType } from "../../lexer/token"
import { Parser } from "../parser"
import { conjunctionParser } from "./L6"

export const disjunctionParser: Parser<L7Disjunction> = (input: Token[]): Maybe<[L7Disjunction, Token[]]> => {
  const conjunctions: L6Conjunction[] = []

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

  const combineConjunctions = (conjunctions: L6Conjunction[]): L7Disjunction => {
    if (conjunctions.length === 1) {
      return conjunctions[0]
    }

    const allConjunctionsButLast = conjunctions.slice(0, conjunctions.length - 1)
    const lastConjunction = conjunctions[conjunctions.length - 1]

    const left = combineConjunctions(allConjunctionsButLast)

    const disjunctionNode: L7Disjunction = {
      type: 'DisjunctionNode',
      left: left,
      right: lastConjunction
    }

    return disjunctionNode
  }

  if (conjunctions.length === 0) return none()

  return some([combineConjunctions(conjunctions), rest])
}