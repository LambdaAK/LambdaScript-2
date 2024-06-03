import { PatL1 } from "./PatL1"

type ConsPat = {
  type: 'ConsPat',
  left: PatL1,
  right: PatL2
}

export type PatL2 = PatL1 | ConsPat