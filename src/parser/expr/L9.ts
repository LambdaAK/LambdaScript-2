import { L9Expr } from "../../AST/expr/L9"
import { Maybe, none, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { patL1Parser } from "../pat/PatL1"
import { consParser } from "./L8"

const functionParser: Parser<L9Expr> = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
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

const ifParser: Parser<L9Expr> = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
  // the first token should be If
  if (input.length === 0) return none()
  if (input[0].type !== "IfToken") return none()
  const tokensAfterIf = input.slice(1) // remove the if token

  // parse the condition, which is an L9Expr

  const conditionResult = exprParser(tokensAfterIf)

  if (conditionResult.type === "None") return none()

  const [condition, rest] = conditionResult.value

  // The next token should be Then

  if (rest.length === 0) return none()

  if (rest[0].type !== 'ThenToken') return none()

  const tokensAfterThen = rest.slice(1)

  // parse the then branch, which is an L9Expr

  const thenResult = exprParser(tokensAfterThen)

  if (thenResult.type === 'None') return none()

  const [thenBranch, rest2] = thenResult.value

  // The next token should be else

  if (rest2.length === 0) return none()

  if (rest2[0].type !== 'ElseToken') return none()

  const tokensAfterElse = rest2.slice(1)

  // parse the else branch, which is an L9Expr

  const elseResult = exprParser(tokensAfterElse)

  if (elseResult.type === 'None') return none()

  const [elseBranch, rest3] = elseResult.value

  // finished

  const ifNode: L9Expr = {
    type: 'IfNode',
    condition: condition,
    thenBranch: thenBranch,
    elseBranch: elseBranch
  }

  return some([ifNode, rest3])
}

export const exprParser: Parser<L9Expr> = combineParsers([functionParser, ifParser, consParser])