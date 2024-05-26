import { Token, BinaryOperatorType } from "./token"

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
  if (input.startsWith('<')) {
    return [{ type: 'LAngle' }, ...lex(input.slice(1))]
  }
  if (input.startsWith('>')) {
    return [{ type: 'RAngle' }, ...lex(input.slice(1))]
  }

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
  if (input.startsWith("*")) {
    return [{ type: 'BopToken', operator: BinaryOperatorType.Times }, ...lex(input.slice(1))]
  }
  if (input.startsWith("/")) {
    return [{ type: 'BopToken', operator: BinaryOperatorType.Divide }, ...lex(input.slice(1))]
  }
  if (input.startsWith("+")) {
    return [{ type: 'BopToken', operator: BinaryOperatorType.Plus }, ...lex(input.slice(1))]
  }
  if (input.startsWith("-")) {
    return [{ type: 'BopToken', operator: BinaryOperatorType.Minus }, ...lex(input.slice(1))]
  }

  if (input.startsWith("True")) {
    return [{ type: 'BooleanToken', value: true }, ...lex(input.slice(4))]
  }

  if (input.startsWith("False")) {
    return [{ type: 'BooleanToken', value: false }, ...lex(input.slice(5))]
  }

  const [token, rest] = lexIdentifier(input)
  return [token, ...lex(rest)]

}