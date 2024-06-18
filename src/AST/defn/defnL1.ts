import { Maybe } from "../../util/maybe"
import { L9Expr } from "../expr/L9"
import { PatL2 } from "../pat/PatL2"

export enum DefnType {
  ConstDefn,
  VarDefn,
}

export type DefnNode = {
  type: "DefnNode",
  pat: PatL2,
  body: L9Expr,
  typeAnnotation: Maybe<TypeL4>,
  defnType: DefnType
}

