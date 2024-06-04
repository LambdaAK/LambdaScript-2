import { Maybe, none, some } from "../../util/maybe"
import { Token } from "../../lexer/token"
import { Parser, combineParsers } from "../parser"
import { typeL1Parser } from "./TypeL1"

const appTypeParser: Parser<TypeL2> = (input: Token[]): Maybe<[TypeL2, Token[]]> => {
  // parse a list of TypeL1, while possible
  const typeL1s: TypeL1[] = []
  let rest = input
  while (true) {
    const result = typeL1Parser(rest)
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

export const typeL2Parser: Parser<TypeL2> = combineParsers([appTypeParser, typeL1Parser])