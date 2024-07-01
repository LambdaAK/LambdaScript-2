import { Expr } from "../AST/expr/expr"
import { Pat } from "../AST/pat/Pat"
import { ImmMap } from "../util/ImmMap"

type Env = ImmMap<string, Value>

type IntValue = {
  type: "IntValue",
  value: number
}

type BoolValue = {
  type: "BoolValue",
  value: boolean
}

type StringValue = {
  type: "StringValue",
  value: string
}

type UnitValue = {
  type: "UnitValue"
}

type FunctionClosure = {
  type: "FunctionClosure",
  pat: Pat,
  body: Expr,
  env: Env
}

type NilValue = {
  type: "NilValue"
}

type ConsValue = {
  type: "ConsValue",
  head: Value,
  tail: Value
}

type Value = IntValue
  | BoolValue
  | StringValue
  | UnitValue
  | FunctionClosure
  | NilValue
  | ConsValue


export {
  Env,
  IntValue,
  BoolValue,
  StringValue,
  UnitValue,
  FunctionClosure,
  NilValue,
  ConsValue,
  Value
}
