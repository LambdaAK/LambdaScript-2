import { L5Rel } from "../../AST/expr/L5"
import { L6Conjunction } from "../../AST/expr/L6"
import { Maybe, none, some } from "../../util/maybe"
import { Token, ConjunctionOperatorType } from "../../lexer/token"
import { Parser } from "../parser"
import { relParser } from "./L5"

export const conjunctionParser: Parser<L6Conjunction> = (input: Token[]): Maybe<[L6Conjunction, Token[]]> => {
  const rels: L5Rel[] = []

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

  const combineRels = (rels: L5Rel[]): L6Conjunction => {
    if (rels.length === 1) {
      return rels[0]
    }

    const allRelsButLast = rels.slice(0, rels.length - 1)
    const lastRel = rels[rels.length - 1]

    const left: L6Conjunction = combineRels(allRelsButLast)

    const conjunctionNode: L6Conjunction = {
      type: 'ConjunctionNode',
      left: left,
      right: lastRel
    }

    return conjunctionNode
  }

  if (rels.length === 0) return none()

  return some([combineRels(rels), rest])
}