import { L4Arith } from "../../AST/expr/L4"
import { L5Rel } from "../../AST/expr/L5"
import { Maybe, none, some } from "../../util/maybe"
import { Token, RelationalOperatorType } from "../../lexer/token"
import { arithParser } from "./L4"

export const relParser = (input: Token[]): Maybe<[L5Rel, Token[]]> => {

  const ariths: L4Arith[] = []
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

  const combineAriths = (ariths: L4Arith[], bops: RelationalOperatorType[]): L5Rel => {
    if (ariths.length === 1) {
      return ariths[0]
    }

    const allArithsButLast = ariths.slice(0, ariths.length - 1)
    const lastArith = ariths[ariths.length - 1]

    const allBopsButLast = bops.slice(0, bops.length - 1)
    const lastBop = bops[bops.length - 1]

    const left = combineAriths(allArithsButLast, allBopsButLast)

    const relNode: L5Rel = {
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