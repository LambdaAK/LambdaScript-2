import { Maybe, none, some } from "../util/maybe";
import { AddOperatorType, BinaryOperatorType, ConjunctionOperatorType, ConsOperatorType, DisjunctionOperatorType, MultiplyOperatorType, RelationalOperatorType, Token } from "../lexer/token";
import { DefnNode, DefnType } from "../AST/defn/defnL1";
import { L1Factor } from "../AST/expr/L1";
import { L2App } from "../AST/expr/L2";
import { L3Term } from "../AST/expr/L3";
import { L4Arith } from "../AST/expr/L4";
import { L5Rel } from "../AST/expr/L5";
import { L6Conjunction } from "../AST/expr/L6";
import { L7Disjunction } from "../AST/expr/L7";
import { L8Cons } from "../AST/expr/L8";
import { L9Expr } from "../AST/expr/L9";
import { PatL1 } from "../AST/pat/PatL1";
import { PatL2 } from "../AST/pat/PatL2";

export type Parser<T> = (input: Token[]) => Maybe<[T, Token[]]>

namespace ParserUtil {
  export const combine = <T>(p1: Parser<T>, p2: Parser<T>): Parser<T> => {
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
  
  export const combineParsers = <T>(parsers: Parser<T>[]): Parser<T> => {
    let combinedParser: Parser<T> = (input: Token[]) => none()
    for (let i = 0; i < parsers.length; i++) {
      combinedParser = combine(combinedParser, parsers[i])
    }
    return combinedParser
  }
  
  export const assertNextToken = (tokens : Token[], expectedType : string) : Maybe<Token[]> => {
    if (tokens.length === 0) return none()
    if (tokens[0].type !== expectedType) return none()
    return some(tokens.slice(1))
  }
}

/*
  L1Expr
*/

namespace L1ExprParser {

  var numberParser: Parser<L1Factor>
  var stringParser: Parser<L1Factor>
  var booleanParser: Parser<L1Factor>
  var identifierParser: Parser<L1Factor>
  var nilParser: Parser<L1Factor>
  var unitParser: Parser<L1Factor>
  var parenFactorParser: Parser<L1Factor>
  export var factorParser: Parser<L1Factor>

  numberParser = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type === 'NumberToken') {
      const numberNode: L1Factor = {
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

  stringParser = (input: Token[]) => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type === 'StringToken') {
      const StringNode: L1Factor = {
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

  booleanParser =
    (input: Token[]): Maybe<[L1Factor, Token[]]> => {
      if (input.length === 0) return { type: 'None' }
      if (input[0].type === 'BooleanToken') {
        const booleanNode: L1Factor = {
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

  identifierParser = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'IdentifierToken') return { type: 'None' }

    const identifierNode: L1Factor = {
      type: 'IdentifierNode',
      value: input[0].value
    }

    return some([identifierNode, input.slice(1)])

  }

  nilParser = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'NilToken') return { type: 'None' }

    const nilNode: L1Factor = {
      type: 'NilNode'
    }

    return some([nilNode, input.slice(1)])
  }

  unitParser = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
    if (input.length < 2) return none()
    // the first token should be LParen
    // the second token should be RParen

    if (input[0].type !== 'LParen') return none()
    if (input[1].type !== 'RParen') return none()

    const tokensAfterParens = input.slice(2)

    const unitNode: L1Factor = {
      type: 'UnitNode'
    }

    return some([unitNode, tokensAfterParens])
  }

  parenFactorParser = (input: Token[]): Maybe<[L1Factor, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'LParen') return { type: 'None' }

    let rest = input.slice(1)
    const result: Maybe<[L9Expr, Token[]]> = L9ExprParser.exprParser(rest)
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

  factorParser = ParserUtil.combineParsers([numberParser, stringParser, booleanParser, identifierParser, nilParser, unitParser, parenFactorParser])

}

/*
  L2Expr
*/

namespace L2ExprParser {

  export var appParser : Parser<L2App>

  appParser = (input: Token[]): Maybe<[L2App, Token[]]> => {
    // parse a list of factors while possible
    // then, fold them an application
    // application is left associative
    const factors: L1Factor[] = []
    let rest: Token[] = input
    while (true) {
      const result = L1ExprParser.factorParser(rest)
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

}

/*
  L3Expr
*/

namespace L3ExprParser {
  export var termParser: Parser<L3Term>

  termParser = (input: Token[]): Maybe<[L3Term, Token[]]> => {
    // parse a list of factors
    const factors: L2App[] = []
    const bops: BinaryOperatorType[] = []

    let rest = input
    // parse a list of factors
    while (true) {
      // parse a factor
      const result = L2ExprParser.appParser(rest)
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

}

/*
  L4Expr
*/

namespace L4ExprParser {
  export var arithParser: Parser<L4Arith>
  arithParser = (input: Token[]): Maybe<[L4Arith, Token[]]> => {
    // parse a list of terms
    const terms: L3Term[] = []
    const bops: BinaryOperatorType[] = []

    let rest = input

    while (true) {
      // parse a term
      const result = L3ExprParser.termParser(rest)
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

}

/*
  L5Expr
*/

namespace L5ExprParser {
  export var relParser: Parser<L5Rel>
  relParser = (input: Token[]): Maybe<[L5Rel, Token[]]> => {

    const ariths: L4Arith[] = []
    const bops: RelationalOperatorType[] = []

    let rest = input


    while (true) {
      const result = L4ExprParser.arithParser(rest)
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
}

/*
  L6Expr
*/
namespace L6ExprParser {
  export var conjunctionParser: Parser<L6Conjunction>
  conjunctionParser = (input: Token[]): Maybe<[L6Conjunction, Token[]]> => {
    const rels: L5Rel[] = []

    let rest = input

    while (true) {
      const result = L5ExprParser.relParser(rest)
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
}

/*
  L7Expr
*/
namespace L7ExprParser {
  export var disjunctionParser: Parser<L7Disjunction>
  disjunctionParser = (input: Token[]): Maybe<[L7Disjunction, Token[]]> => {
    const conjunctions: L6Conjunction[] = []

    let rest = input

    while (true) {
      const result = L6ExprParser.conjunctionParser(rest)


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
}

/*
  L8Expr
*/

namespace L8ExprParser {
  export var consParser: Parser<L8Cons>
  consParser = (input: Token[]): Maybe<[L8Cons, Token[]]> => {
    // parse a disjunction
    const result = L7ExprParser.disjunctionParser(input)
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
      // parse a L8Cons and make a ConsNode
      const result2 = consParser(tokensAfterCons)
      if (result2.type === 'None') {
        return none()
      }
      const [L8Cons, rest2] = result2.value
      const consNode: L8Cons = {
        type: 'ConsNode',
        left: disjunction,
        right: L8Cons
      }

      return some([consNode, rest2])
    }
    else {
      // since the next token is an operator, but not a cons operator, do not continue parsing
      return some([disjunction, rest])
    }
  }
}

/*
  L9Expr
*/

namespace L9ExprParser {

  var parseInputPatWithoutTypeAnnotation: (input: Token[]) => Maybe<[PatL1, Maybe<TypeL4>, Token[]]>

  var parseInputPatWithTypeAnnotation: (input: Token[]) => Maybe<[PatL1, Maybe<TypeL4>, Token[]]>

  var parseInputPatAndTypeAnnotation: (input: Token[]) => Maybe<[PatL1, Maybe<TypeL4>, Token[]]>

  var functionParser: Parser<L9Expr>

  var ifParser: Parser<L9Expr>

  var statementParser: Parser<L9Expr | DefnNode>

  var blockParser: Parser<L9Expr>

  var caseParser: (input: Token[]) => Maybe<[PatL2, L9Expr, Token[]]>

  var matchParser: Parser<L9Expr>

  export var exprParser: Parser<L9Expr>

  parseInputPatWithoutTypeAnnotation = (input: Token[]): Maybe<[PatL1, Maybe<TypeL4>, Token[]]> => {
    // parse the pattern
    const patResult = L1PatParser.patL1Parser(input)
    if (patResult.type === 'None') return none()
    const [pat, rest] = patResult.value
    return some([pat, none(), rest])
  }

  parseInputPatWithTypeAnnotation = (input: Token[]): Maybe<[PatL1, Maybe<TypeL4>, Token[]]> => {
    // if the first token is not a paren, return none
    if (input.length === 0) return none()
    if (input[0].type !== 'LParen') return none()
    const tokensAfterLParen = input.slice(1)
    // parse the pattern
    const patResult = L1PatParser.patL1Parser(tokensAfterLParen)

    if (patResult.type === 'None') return none()

    const [pat, rest] = patResult.value

    // the next token should be a colon

    if (rest.length === 0) return none()

    if (rest[0].type !== 'ColonToken') return none()

    const tokensAfterColon = rest.slice(1)

    // parse the type annotation, which is a typeL4

    const typeResult = L4TypeParser.typeL4Parser(tokensAfterColon)

    if (typeResult.type === 'None') return none()

    const [typeAnnotation, rest2] = typeResult.value

    // the next token should be LParen

    if (rest2.length === 0) return none()

    if (rest2[0].type !== 'RParen') return none()

    const rest3 = rest2.slice(1)

    return some([pat, some(typeAnnotation), rest3])
  }

  parseInputPatAndTypeAnnotation = (input: Token[]): Maybe<[PatL1, Maybe<TypeL4>, Token[]]> => {
    const result1 = parseInputPatWithoutTypeAnnotation(input)
    if (result1.type === 'Some') return result1
    const result2 = parseInputPatWithTypeAnnotation(input)
    return result2
  }


  functionParser = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
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

  ifParser = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
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


  statementParser = (input: Token[]): Maybe<[(L9Expr | DefnNode), Token[]]> => {
    // a statement is either a definition or an expression
    // try to parse a definition
    const defnResult = DefnParser.defnParser(input)
    if (defnResult.type === "Some") {
      return defnResult
    }
    // try to parse an expression
    const exprResult = exprParser(input)
    return exprResult
  }

  caseParser = (input: Token[]): Maybe<[PatL2, L9Expr, Token[]]> => {
    // parse the case keyword

    const tokensAfterCaseResult = ParserUtil.assertNextToken(input, "CaseToken")
    if (tokensAfterCaseResult.type === "None") return none()
    const tokensAfterCase = tokensAfterCaseResult.value

    // parse the pattern

    const patResult = L2PatParser.patL2Parser(tokensAfterCase)
    if (patResult.type === "None") return none()
    const [pat, tokensAfterPat] = patResult.value

    // parse the fat arrow
    const tokensAfterFatArrowResult = ParserUtil.assertNextToken(tokensAfterPat, "FatArrow")
    if (tokensAfterFatArrowResult.type === "None") return none()
    const tokensAfterFatArrow = tokensAfterFatArrowResult.value

    // parse the expression

    const exprResult = exprParser(tokensAfterFatArrow)
    if (exprResult.type === "None") return none()

    const [expr, rest] = exprResult.value

    // parse the semicolon

    const tokensAfterSemiColonResult = ParserUtil.assertNextToken(rest, "SemiColonToken");

    if (tokensAfterSemiColonResult.type === "None") return none()
    const tokensAfterSemiColon = tokensAfterSemiColonResult.value



    return some([pat, expr, tokensAfterSemiColon])


  }


  blockParser = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
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

    const tokensAfterLBraceResult = ParserUtil.assertNextToken(input, "LBrace")
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

      const tokensAfterSemiColonResult = ParserUtil.assertNextToken(tokens, "SemiColonToken")

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

    const tokensAfterStatementsResult = ParserUtil.assertNextToken(tokens, "RBrace")

    if (tokensAfterStatementsResult.type === "None") return none()

    const tokensAfterStatements = tokensAfterStatementsResult.value

    // finished

    const blockNode: L9Expr = {
      type: "BlockNode",
      statements: statements,
    }

    return some([blockNode, tokensAfterStatements])
  }

  matchParser = (input: Token[]): Maybe<[L9Expr, Token[]]> => {
    /*
      match e with {
        case p1 => e1;
        case p2 => e2;
        ...
        case pN => eN;
      }
    */
    // parse the match keyword
  
    const tokensAfterMatchResult = ParserUtil.assertNextToken(input, "MatchToken")
    if (tokensAfterMatchResult.type === "None") return none()
    const tokensAfterMatch = tokensAfterMatchResult.value

    // parse the expression e

    const exprResult = exprParser(tokensAfterMatch)

    if (exprResult.type === "None") return none()
  

    const [expr, tokensAfterExpr] = exprResult.value

    // parse the with keyword

    const tokensAfterWithResult = ParserUtil.assertNextToken(tokensAfterExpr, "WithToken")
    if (tokensAfterWithResult.type === "None") return none()
    const tokensAfterWith = tokensAfterWithResult.value

    // parse the LBrace

    const tokensAfterLBraceResult = ParserUtil.assertNextToken(tokensAfterWith, "LBrace")
    if (tokensAfterLBraceResult.type === "None") return none()
    const tokensAfterLBrace = tokensAfterLBraceResult.value

    // parse the cases

    const cases: [PatL2, L9Expr][] = []
    let remainingTokens: Token[] = tokensAfterLBrace
    
    while (true) {
      // parse a case
      const caseResult = caseParser(remainingTokens)
      if (caseResult.type === "None") break
      const [pat, expr, rest] = caseResult.value
      remainingTokens = rest
      cases.push([pat, expr])
    }

    // parse an RBrace

    const tokensAfterRBraceResult = ParserUtil.assertNextToken(remainingTokens, "RBrace")
    if (tokensAfterRBraceResult.type === "None") return none()
    const tokensAfterRBrace = tokensAfterRBraceResult.value

    // construct the match node

    const matchNode: L9Expr = {
      type: "MatchNode",
      expr: expr,
      cases: cases
    }

    return some([matchNode, tokensAfterRBrace])
  }

  exprParser = ParserUtil.combineParsers([matchParser, blockParser, functionParser, ifParser, L8ExprParser.consParser])
}
/*
  PatL1
*/

namespace L1PatParser {
  var nilPatParser: Parser<PatL1>

  var boolPatParser: Parser<PatL1>

  var stringPatParser: Parser<PatL1>

  var intPatParser : Parser<PatL1>

  var wildcardPatParser: Parser<PatL1>

  var unitPatParser: Parser<PatL1>

  var idPatParser: Parser<PatL1>

  var parenPatParser: Parser<PatL1>

  export var patL1Parser: Parser<PatL1>

  nilPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
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

  boolPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
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

  stringPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
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

  intPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
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

  wildcardPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
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

  unitPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
    if (input.length < 2) return { type: 'None' }
    if (input[0].type !== 'LParen') return { type: 'None' }
    if (input[1].type !== 'RParen') return { type: 'None' }
   
      const unitNode: PatL1 = {
        type: 'UnitPat'
      }
      return {
        type: 'Some',
        value: [unitNode, input.slice(1)]
      }

   
  }

  idPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
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

  parenPatParser = (input: Token[]): Maybe<[PatL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'LParen') return { type: 'None' }

    let rest = input.slice(1)
    const result: Maybe<[PatL2, Token[]]> = L2PatParser.patL2Parser(rest)
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

  patL1Parser = ParserUtil.combineParsers([nilPatParser, boolPatParser, stringPatParser, intPatParser, wildcardPatParser, unitPatParser, idPatParser, parenPatParser])

}

/*
  PatL2
*/

namespace L2PatParser {
  var consPatParser: Parser<PatL2>
  export var patL2Parser: Parser<PatL2>
  consPatParser = (input: Token[]): Maybe<[PatL2, Token[]]> => {
    // parse a PatL1
    const result = L1PatParser.patL1Parser(input)
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
      const result2 = L2PatParser.patL2Parser(tokensAfterCons)
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

  patL2Parser = ParserUtil.combineParsers([consPatParser, L1PatParser.patL1Parser])
}
/*
  TypeL1
*/

namespace L1TypeParser {
  var unitTypeParser: Parser<TypeL1>
  var boolTypeParser: Parser<TypeL1>
  var stringTypeParser: Parser<TypeL1>
  var intTypeParser: Parser<TypeL1>
  var parenTypeParser: Parser<TypeL1>
  var listTypeParser: Parser<TypeL1>
  var typeVarParser: Parser<TypeL1>
  export var typeL1Parser: Parser<TypeL1>

  unitTypeParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'UnitTypeToken') return { type: 'None' }
    return some([{
      type: 'UnitType'
    }, input.slice(1)])
  }

  boolTypeParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'BoolTypeToken') return { type: 'None' }
    return some([{
      type: 'BoolType'
    }, input.slice(1)])
  }

  stringTypeParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'StringTypeToken') return { type: 'None' }
    return some([{
      type: 'StringType'
    }, input.slice(1)])
  }

  intTypeParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'IntTypeToken') return { type: 'None' }
    return some([{
      type: 'IntType'
    }, input.slice(1)])
  }

  parenTypeParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'LParen') return { type: 'None' }

    let rest = input.slice(1)
    const result: Maybe<[TypeL4, Token[]]> = L4TypeParser.typeL4Parser(rest)
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

  listTypeParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length == 0 || input[0].type !== 'LBracket') return none()
    const rest = input.slice(1)
    const insideTypeResult = L3TypeParser.typeL3Parser(rest)
    if (insideTypeResult.type === 'None') return none()
    const [insideType, rest2] = insideTypeResult.value
    if (rest2.length === 0 || rest2[0].type !== 'RBracket') return none()

    const newType: TypeL1 = {
      type: 'ListType',
      t: insideType
    }

    return some([newType, rest2.slice(1)])
  }

  typeVarParser = (input: Token[]): Maybe<[TypeL1, Token[]]> => {
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'IdentifierToken') return { type: 'None' }
    return some([{
      type: 'TypeVar',
      name: input[0].value
    }, input.slice(1)])

  }

  typeL1Parser = ParserUtil.combineParsers([listTypeParser, unitTypeParser, boolTypeParser, stringTypeParser, intTypeParser, parenTypeParser, typeVarParser])

}
/*
  TypeL2
*/
namespace L2TypeParser {

  var appTypeParser: Parser<TypeL2>
  export var typeL2Parser: Parser<TypeL2>

  appTypeParser = (input: Token[]): Maybe<[TypeL2, Token[]]> => {
    // parse a list of TypeL1, while possible
    const typeL1s: TypeL1[] = []
    let rest = input
    while (true) {
      const result = L1TypeParser.typeL1Parser(rest)
      if (result.type === 'None') break
      typeL1s.push(result.value[0])
      rest = result.value[1]
    }
    // if we didn't parse any TypeL1, return None
    if (typeL1s.length === 0) return none()
    // combine the TypeL1s into an AppType using reduce

    const combine = (types: TypeL1[]): TypeL2 => {
      if (types.length === 1) return types[0]
      const allButLast = types.slice(0, types.length - 1)
      const last = types[types.length - 1]
      // turn allButLast into AppType
      const appType: TypeL2 = combine(allButLast)
      // combine the AppType with the last
      const finalAppType: TypeL2 = {
        type: 'AppType',
        left: appType,
        right: last
      }
      return finalAppType
    }

    return some([combine(typeL1s), rest])

  }

  typeL2Parser = ParserUtil.combineParsers([appTypeParser, L1TypeParser.typeL1Parser])
}
/*
  TypeL3
*/

namespace L3TypeParser {
  var functionTypeParser: Parser<TypeL3>
  export var typeL3Parser: Parser<TypeL3>
  functionTypeParser = (input: Token[]): Maybe<[TypeL3, Token[]]> => {
    // pl1 -> pl2
    // parse a TypeL1
    const result1 = L2TypeParser.typeL2Parser(input)
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
    const result2 = typeL3Parser(rest.slice(1))
    if (result2.type === 'None') {
      return none()
    }
    const [right, rest2] = result2.value
    // make a FunctionType
    const functionType: TypeL3 = {
      type: 'FunctionType',
      left: left,
      right: right
    }
    return some([functionType, rest2])
  }

  typeL3Parser = ParserUtil.combineParsers([functionTypeParser, L2TypeParser.typeL2Parser])
}
/*
  TypeL4
*/

namespace L4TypeParser {
  var polymorphicTypeParser: Parser<TypeL4>
  export var typeL4Parser: Parser<TypeL4>
  polymorphicTypeParser = (input: Token[]): Maybe<[TypeL4, Token[]]> => {
    // first token should be Fn
    if (input.length === 0) {
      return none()
    }
    if (input[0].type !== 'FNToken') {
      return none()
    }

    const tokensAfterFn = input.slice(1)

    // the next token should be an identifier (the argument to the polymorphic type)

    if (tokensAfterFn.length === 0) {
      return none()
    }

    if (tokensAfterFn[0].type !== 'IdentifierToken') {
      return none()
    }

    const argument = tokensAfterFn[0].value

    const tokensAfterIdentifier = tokensAfterFn.slice(1)

    // the next token should be an arrow

    if (tokensAfterIdentifier.length === 0) {
      return none()
    }

    if (tokensAfterIdentifier[0].type !== 'RightArrow') {
      return none()
    }

    const tokensAfterArrow = tokensAfterIdentifier.slice(1)

    // the body of the polymorphic type should be a TypeL3

    const result = typeL4Parser(tokensAfterArrow)

    if (result.type === 'None') {
      return none()
    }

    const [body, rest] = result.value

    const polymorphicType: TypeL4 = {
      type: 'PolymorphicType',
      input: argument,
      output: body
    }

    return some([polymorphicType, rest])
  }
  typeL4Parser = ParserUtil.combineParsers([polymorphicTypeParser, L3TypeParser.typeL3Parser])
}
/*
  DefnParser
*/

namespace DefnParser {
  export var defnParser: Parser<DefnNode>
  var parseOptionalTypeAnnotation: (input: Token[]) => Maybe<[TypeL4, Token[]]>
  parseOptionalTypeAnnotation = (input: Token[]): Maybe<[TypeL4, Token[]]> => {
    if (input.length === 0) return none()
    if (input[0].type !== 'ColonToken') return none()
    const tokensAfterColon = input.slice(1)
    // parse a type annotation
    const typeAnnotationResult = L4TypeParser.typeL4Parser(tokensAfterColon)
    return typeAnnotationResult
  }

  defnParser = (input: Token[]) => {
    // check for the const or keyword
    if (input.length === 0) return { type: 'None' }
    if (input[0].type !== 'ValToken') return none()
    
    const defnType = DefnType.ConstDefn

    // next is the pattern

    const tokensAfterDefnType = input.slice(1)

    // parse the pattern

    const pat = L1PatParser.patL1Parser(tokensAfterDefnType)
    
    if (pat.type === 'None') return none()

    const [parsedPat, tokensAfterPat] = pat.value
    
    // there might be a type annotation

    const typeAnnotationResult = parseOptionalTypeAnnotation(tokensAfterPat)

    const [typeAnnotation, tokensAfterTypeAnnotation] = (() => {
      if (typeAnnotationResult.type === "None") return [none(), tokensAfterPat]
      else {
        const [ta, rest] = typeAnnotationResult.value
        return [some(ta), rest]
      }
    })()

    // there should be an equals sign next

    if (tokensAfterTypeAnnotation.length === 0) return none()
    if (tokensAfterTypeAnnotation[0].type !== 'EqualsToken') return none()

    const tokensAfterEquals = tokensAfterTypeAnnotation.slice(1)

    // parse the body of the definition

    const bodyResult = L9ExprParser.exprParser(tokensAfterEquals)

    if (bodyResult.type === 'None') return none()

    const [body, tokensAfterBody] = bodyResult.value
    
    const defn: DefnNode = {
      type: "DefnNode",
      pat: parsedPat,
      body: body,
      typeAnnotation: typeAnnotation,
      defnType: defnType
    }

    return some([defn, tokensAfterBody])

  }
}

export {
  L9ExprParser
}