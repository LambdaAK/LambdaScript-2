
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
