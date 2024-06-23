import { L1Factor } from "../../AST/expr/L1"
import { L2App } from "../../AST/expr/L2"
import { Maybe, none, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser } from "../parser"
import { factorParser } from "./L1"

export var appParser: Parser<L2App> = (input: Token[]): Maybe<[L2App, Token[]]> => {
  // parse a list of factors while possible
  // then, fold them an application
  // application is left associative
  const factors: L1Factor[] = []
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


  const combineFactorsIntoApp = (factors: L1Factor[]): L2App => {

    // a b c === (a b) c

    // take off the last one
    if (factors.length == 1) return factors[0]

    const allFactorsButLast = factors.slice(0, factors.length - 1)
    const right = factors[factors.length - 1]

    const left = combineFactorsIntoApp(allFactorsButLast)

    const newApp: L2App = {
      type: "ApplicationNode",
      left: left,
      right: right
    }

    return newApp

  }

  // fold the factors into an L2App

  if (factors.length === 0) return none()

  const L2App: L2App = combineFactorsIntoApp(factors)

  return some([L2App, rest])

}