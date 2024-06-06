import { Pat } from "./Pat";
import { PatL2 } from "./PatL2";


export const condensePat = (pat: PatL2): Pat => {
  switch (pat.type) {
    case "ConsPat":
      return {
        type: "ConsPatAST",
        left: condensePat(pat.left),
        right: condensePat(pat.right)
      }

    case "BoolPat":
      return {
        type: "BoolPatAST",
        value: pat.value
      }

    case "StringPat":
      return {
        type: "StringPat",
        value: pat.value
      }

    case "IntPat":
      return {
        type: "IntPatAST",
        value: pat.value
      }

    case "WildcardPat":
      return {
        type: "WildcardPatAST"
      }

    case "UnitPat":
      return {
        type: "UnitPatAST"
      }

    case "IdPat":
      return {
        type: "IdPatAST",
        value: pat.value
      }

    case "NilPat":
      return {
        type: "NilPatAST"
      }

    case "ParenPat":
      return condensePat(pat.node)

  }
}