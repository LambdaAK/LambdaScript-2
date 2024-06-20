
type NilPatAST = {
  type: "NilPatAST"
}

type BoolPatAST = {
  type: "BoolPatAST",
  value: boolean
}

type StringPat = {
  type: "StringPat",
  value: string
}

type IntPatAST = {
  type: "IntPatAST",
  value: number
}

type WildcardPatAST = {
  type: "WildcardPatAST"
}

type UnitPatAST = {
  type: "UnitPatAST"
}

type IdPatAST = {
  type: "IdPatAST",
  value: string
}

type ConsPatAST = {
  type: "ConsPatAST",
  left: Pat,
  right: Pat
}

export type Pat = NilPatAST
  | BoolPatAST
  | StringPat
  | IntPatAST
  | WildcardPatAST
  | UnitPatAST
  | IdPatAST
  | ConsPatAST

export const stringOfPat = (pat: Pat): string => {
  switch (pat.type) {
    case "NilPatAST":
      return "Nil"
    case "BoolPatAST":
      return pat.value.toString()
    case "StringPat":
      return pat.value
    case "IntPatAST":
      return pat.value.toString()
    case "WildcardPatAST":
      return "_"
    case "UnitPatAST":
      return "()"
    case "IdPatAST":
      return pat.value
    case "ConsPatAST":
      return `(${stringOfPat(pat.left)} :: ${stringOfPat(pat.right)})`
  }
}