import { PatL2 } from "./PatL2"

type NilPat = {
  type: 'NilPat'
}

type BoolPat = {
  type: 'BoolPat',
  value: boolean
}

type StringPat = {
  type: 'StringPat',
  value: string
}

type IntPat = {
  type: 'IntPat',
  value: number
}

type WildcardPat = {
  type: 'WildcardPat'
}

type UnitPat = {
  type: 'UnitPat'
}

type IdPat = {
  type: 'IdPat',
  value: string
}

type ParenPat = {
  type: 'ParenPat',
  node: PatL2
}

export type PatL1 = NilPat | BoolPat | StringPat | IntPat | WildcardPat | UnitPat | IdPat | ParenPat