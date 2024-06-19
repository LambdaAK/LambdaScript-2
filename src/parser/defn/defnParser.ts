import { DefnNode, DefnType } from "../../AST/defn/defnL1";
import { Token } from "../../lexer/token";
import { Maybe, none, some } from "../../util/maybe";
import { exprParser } from "../expr/L9";
import { Parser } from "../parser";
import { patL1Parser } from "../pat/PatL1";
import { patL2Parser } from "../pat/PatL2";
import { typeL4Parser } from "../type/TypeL4";


const parseOptionalTypeAnnotation = (input: Token[]): Maybe<[TypeL4, Token[]]> => {
  if (input.length === 0) return none()
  if (input[0].type !== 'ColonToken') return none()
  const tokensAfterColon = input.slice(1)
  // parse a type annotation
  const typeAnnotationResult = typeL4Parser(tokensAfterColon)
  return typeAnnotationResult
}

export const defnParser: Parser<DefnNode> = (input: Token[]) => {
  // check for the const or var keyword
  if (input.length === 0) return { type: 'None' }
  if (input[0].type !== 'ConstToken') return none()
  
  const defnType = DefnType.ConstDefn

  // next is the pattern

  const tokensAfterDefnType = input.slice(1)

  // parse the pattern

  const pat = patL1Parser(tokensAfterDefnType)
  
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

  const bodyResult = exprParser(tokensAfterEquals)

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