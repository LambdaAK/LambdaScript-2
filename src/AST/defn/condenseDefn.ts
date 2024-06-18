import { none, some } from "../../util/maybe";
import { condenseExpr } from "../expr/condenseExpr";
import { condensePat } from "../pat/condensePat";
import { condenseType } from "../type/condenseType";
import { DefnAST } from "./defn";
import { DefnNode } from "./defnL1";

export const condenseDefn = (defn: DefnNode): DefnAST => {
  return {
    type: "DefnAST",
    pat: condensePat(defn.pat),
    body: condenseExpr(defn.body),
    typeAnnotation: defn.typeAnnotation.type === "None" ? none() : some(condenseType(defn.typeAnnotation.value)),
    defnType: defn.defnType
  }
}