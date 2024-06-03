import { L3Term } from "./L3"

type PlusNode = {
  type: 'PlusNode',
  left: L4Arith,
  right: L3Term
}

type MinusNode = {
  type: 'MinusNode',
  left: L4Arith,
  right: L3Term
}

export type L4Arith =
  | L3Term
  | PlusNode
  | MinusNode