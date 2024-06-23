import { Maybe, none, some } from "../util/maybe";
import { Token } from "../lexer/token";

export type Parser<T> = (input: Token[]) => Maybe<[T, Token[]]>

const combine = <T>(p1: Parser<T>, p2: Parser<T>): Parser<T> => {
  console.log(p2)
  console.log(typeof p2)
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
  console.log("combining parsers")
  console.log(parsers)
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