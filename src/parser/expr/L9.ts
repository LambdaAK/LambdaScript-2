import { L9Expr } from "../../AST/expr/L9"
import { Maybe, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { patL1Parser } from "../pat/PatL1"
import { consParser } from "./L8"

const FunctionParser: Parser<L9Expr> = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
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

  // parse the body of the function, which is an L9Expr

  const resultBody = exprParser(tokensAfterArrow)

  if (resultBody.type === 'None') {
    return { type: 'None' }
  }

  const [body, rest2] = resultBody.value

  const functionNode: L9Expr = {
    type: 'FunctionNode',
    pattern: pat,
    body: body
  }

  return some([functionNode, rest2])
}

export const exprParser: Parser<L9Expr> = combineParsers([FunctionParser, consParser])