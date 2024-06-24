import { Token, BinaryOperatorType, AddOperatorType, MultiplyOperatorType, RelationalOperatorType, ConjunctionOperatorType, DisjunctionOperatorType, ConsOperatorType } from "./token"

const isDigit = (char: string) => /\d/.test(char)

const isAlpha = (char: string) => {
  const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'
  return alpha.includes(char)
}

const lexNumber = (input: string): [Token, string] => {
  let i = 0
  while (isDigit(input[i])) {
    i++
  }
  return [{ type: 'NumberToken', value: parseInt(input.slice(0, i)) }, input.slice(i)]
}

const lexString = (input: string): [Token, string] => {
  // the first character is a quote
  // look for the next quote
  // everything between those two quotes is the string
  let i = 1
  while (input[i] !== "\"") {
    i++
  }
  return [{ type: 'StringToken', value: input.slice(1, i) }, input.slice(i + 1)]
}

const lexIdentifier = (input: string): [Token, string] => {
  let i = 0
  while (isAlpha(input[i])) {
    i++
  }

  return [{ type: 'IdentifierToken', value: input.slice(0, i) }, input.slice(i)]
}

export const lex = (input: string): Token[] => {
  if (input.length === 0) return []
  if (input.startsWith(' ')) return lex(input.slice(1))

  if (input.startsWith("\n")) return lex(input.slice(1))

  if (input.startsWith('(')) {
    return [{ type: 'LParen' }, ...lex(input.slice(1))]
  }

  if (input.startsWith(')')) {
    return [{ type: 'RParen' }, ...lex(input.slice(1))]
  }

  if (isDigit(input[0])) {
    const [token, rest] = lexNumber(input)
    return [token, ...lex(rest)]
  }
  if (input.startsWith("\"")) {
    const [token, rest] = lexString(input)
    return [token, ...lex(rest)]
  }
  if (input.startsWith("->")) {
    return [{ type: 'RightArrow' }, ...lex(input.slice(2))]
  }
  if (input.startsWith("Unit")) {
    return [{ type: 'UnitTypeToken' }, ...lex(input.slice(4))]
  }
  if (input.startsWith("Bool")) {
    return [{ type: 'BoolTypeToken' }, ...lex(input.slice(4))]
  }
  if (input.startsWith("String")) {
    return [{ type: 'StringTypeToken' }, ...lex(input.slice(6))]
  }
  if (input.startsWith("Int")) {
    return [{ type: 'IntTypeToken' }, ...lex(input.slice(3))]
  }
  if (input.startsWith("*")) {
    return [{ type: 'BopToken', operator: MultiplyOperatorType.Times }, ...lex(input.slice(1))]
  }
  if (input.startsWith("/")) {
    return [{ type: 'BopToken', operator: MultiplyOperatorType.Divide }, ...lex(input.slice(1))]
  }
  if (input.startsWith("+")) {
    return [{ type: 'BopToken', operator: AddOperatorType.Plus }, ...lex(input.slice(1))]
  }
  if (input.startsWith("-")) {
    return [{ type: 'BopToken', operator: AddOperatorType.Minus }, ...lex(input.slice(1))]
  }

  if (input.startsWith("==")) {
    return [{ type: 'BopToken', operator: RelationalOperatorType.Equal }, ...lex(input.slice(2))]
  }

  if (input.startsWith("!=")) {
    return [{ type: 'BopToken', operator: RelationalOperatorType.NotEqual }, ...lex(input.slice(2))]
  }

  if (input.startsWith("<=")) {
    return [{ type: 'BopToken', operator: RelationalOperatorType.LessThanEqual }, ...lex(input.slice(2))]
  }

  if (input.startsWith(">=")) {
    return [{ type: 'BopToken', operator: RelationalOperatorType.GreaterThanEqual }, ...lex(input.slice(2))]
  }

  if (input.startsWith(">")) {
    return [{ type: 'BopToken', operator: RelationalOperatorType.GreaterThan }, ...lex(input.slice(1))]
  }

  if (input.startsWith("<")) {
    return [{ type: 'BopToken', operator: RelationalOperatorType.LessThan }, ...lex(input.slice(1))]
  }

  if (input.startsWith("&&")) {
    return [{ type: 'BopToken', operator: ConjunctionOperatorType.And }, ...lex(input.slice(2))]
  }

  if (input.startsWith("||")) {
    return [{ type: 'BopToken', operator: DisjunctionOperatorType.Or }, ...lex(input.slice(2))]
  }

  if (input.startsWith("::")) {
    return [{ type: 'BopToken', operator: ConsOperatorType.Cons }, ...lex(input.slice(2))]
  }

  if (input.startsWith(":")) {
    return [{ type: 'ColonToken' }, ...lex(input.slice(1))]
  }

  if (input.startsWith("True")) {
    return [{ type: 'BooleanToken', value: true }, ...lex(input.slice(4))]
  }

  if (input.startsWith("False")) {
    return [{ type: 'BooleanToken', value: false }, ...lex(input.slice(5))]
  }

  if (input.startsWith("[]")) {
    return [{ type: 'NilToken' }, ...lex(input.slice(2))]
  }

  if (input.startsWith("[")) {
    return [{ type: 'LBracket' }, ...lex(input.slice(1))]
  }

  if (input.startsWith("]")) {
    return [{ type: 'RBracket' }, ...lex(input.slice(1))]
  }

  if (input.startsWith("_")) {
    return [{ type: 'Wildcard' }, ...lex(input.slice(1))]
  }

  if (input.startsWith("fn")) {
    return [{ type: 'FnToken' }, ...lex(input.slice(2))]
  }

  if (input.startsWith("tfn")) {
    return [{ type: 'FNToken' }, ...lex(input.slice(2))]
  }

  if (input.startsWith("if")) {
    return [{ type: 'IfToken' }, ...lex(input.slice(2))]
  }

  if (input.startsWith("then")) {
    return [{ type: 'ThenToken' }, ...lex(input.slice(4))]
  }

  if (input.startsWith("else")) {
    return [{ type: 'ElseToken' }, ...lex(input.slice(4))]
  }

  if (input.startsWith("val")) {
    return [{ type: 'ValToken' }, ...lex(input.slice(3))]
  }

  if (input.startsWith("var")) {
    return [{ type: 'VarToken' }, ...lex(input.slice(3))]
  }

  if (input.startsWith("=>")) {
    return [{ type: 'FatArrow' }, ...lex(input.slice(2))]
  }

  if (input.startsWith("=")) {
    return [{ type: 'EqualsToken' }, ...lex(input.slice(1))]
  }

  if (input.startsWith(";")) {
    return [{ type: 'SemiColonToken' }, ...lex(input.slice(1))]
  }

  if (input.startsWith("{")) {
    return [{ type: 'LBrace' }, ...lex(input.slice(1))]
  } 
  if (input.startsWith("}")) {
    return [{ type: 'RBrace' }, ...lex(input.slice(1))]
  }

  if (input.startsWith("switch")) {
    return [{ type: 'SwitchToken' }, ...lex(input.slice(6))]
  }

  if (input.startsWith("case")) {
    return [{ type: 'CaseToken' }, ...lex(input.slice(4))]
  }

  const [token, rest] = lexIdentifier(input)
  return [token, ...lex(rest)]

}