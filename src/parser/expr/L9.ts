import { L9Expr } from "../../AST/expr/L9"
import { Maybe, none, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, assertNextToken, combineParsers } from "../parser"
import { patL1Parser } from "../pat/PatL1"
import { consParser } from "./L8"
import { typeL4Parser } from "../type/TypeL4"
import { PatL1 } from "../../AST/pat/PatL1"
import { defnParser } from "../defn/defnParser"
import { DefnNode } from "../../AST/defn/defnL1"

var parseInputPatWithoutTypeAnnotation = (input: Token[]): Maybe<[PatL1, Maybe<TypeL4>, Token[]]> => {
  // parse the pattern
  const patResult = patL1Parser(input)
  if (patResult.type === 'None') return none()
  const [pat, rest] = patResult.value
  return some([pat, none(), rest])
}

var parseInputPatWithTypeAnnotation = (input: Token[]): Maybe<[PatL1, Maybe<TypeL4>, Token[]]> => {
  // if the first token is not a paren, return none
  if (input.length === 0) return none()
  if (input[0].type !== 'LParen') return none()
  const tokensAfterLParen = input.slice(1)
  // parse the pattern
  const patResult = patL1Parser(tokensAfterLParen)

  if (patResult.type === 'None') return none()

  const [pat, rest] = patResult.value

  // the next token should be a colon

  if (rest.length === 0) return none()

  if (rest[0].type !== 'ColonToken') return none()

  const tokensAfterColon = rest.slice(1)

  // parse the type annotation, which is a typeL4

  const typeResult = typeL4Parser(tokensAfterColon)

  if (typeResult.type === 'None') return none()

  const [typeAnnotation, rest2] = typeResult.value

  // the next token should be LParen

  if (rest2.length === 0) return none()

  if (rest2[0].type !== 'RParen') return none()

  const rest3 = rest2.slice(1)

  return some([pat, some(typeAnnotation), rest3])
}

var parseInputPatAndTypeAnnotation = (input: Token[]): Maybe<[PatL1, Maybe<TypeL4>, Token[]]> => {
  const result1 = parseInputPatWithoutTypeAnnotation(input)
  if (result1.type === 'Some') return result1
  const result2 = parseInputPatWithTypeAnnotation(input)
  return result2
}


export var functionParser: Parser<L9Expr> = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
  const resultPat = parseInputPatAndTypeAnnotation(input)
  if (resultPat.type === 'None') {
    return { type: 'None' }
  }
  const [pat, typeAnnotation, rest] = resultPat.value
  // the next token should be Arrow
  if (rest.length === 0) return { type: 'None' }
  if (rest[0].type !== 'FatArrow') return { type: 'None' }

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
    body: body,
    typeAnnotation: typeAnnotation
  }

  return some([functionNode, rest2])
}

var ifParser: Parser<L9Expr> = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
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


var statementParser: Parser<L9Expr | DefnNode> = (input: Token[]): Maybe<[(L9Expr | DefnNode), Token[]]> => {
  // a statement is either a definition or an expression
  // try to parse a definition
  const defnResult = defnParser(input)
  if (defnResult.type === "Some") {
    return defnResult
  }
  // try to parse an expression
  const exprResult = exprParser(input)
  return exprResult
}


var blockParser: Parser<L9Expr> = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
  /*
  {
    statement1;
    statement2;
    ....
    statementN;
  }

  statementN is an L9Expr
  */

  // the first token should be LBrace

  const tokensAfterLBraceResult = assertNextToken(input, "LBrace")
  if (tokensAfterLBraceResult.type === "None") return none()

  const tokensAfterLBrace = tokensAfterLBraceResult.value

  const statements: (L9Expr | DefnNode)[] = []
  
  let tokens: Token[] = tokensAfterLBrace
  
  while (true) {
    // while we can, parse a statement

    const statementResult = statementParser(tokens)

    // check if it's none or some
    
    if (statementResult.type === "None") {
      break
    }

    // update the list of statements and list of tokens

    const [statement, rest] = statementResult.value

    statements.push(statement)

    tokens = rest

    // the next token should be a semicolon

    const tokensAfterSemiColonResult = assertNextToken(tokens, "SemiColonToken")

    if (tokensAfterSemiColonResult.type === "None") {
      return none()
    }

    tokens = tokensAfterSemiColonResult.value

  }
  
  // verify that the last statement is not a definition

  if (statements.length === 0) return none()
  
  const lastStatement = statements[statements.length - 1]

  if (lastStatement.type == "DefnNode") return none()

  // the next token should be RBrace

  const tokensAfterStatementsResult = assertNextToken(tokens, "RBrace")

  if (tokensAfterStatementsResult.type === "None") return none()

  const tokensAfterStatements = tokensAfterStatementsResult.value

  // finished

  const blockNode: L9Expr = {
    type: "BlockNode",
    statements: statements,
  }

  return some([blockNode, tokensAfterStatements])
}

export var exprParser: Parser<L9Expr> = combineParsers([blockParser, functionParser, ifParser, consParser])