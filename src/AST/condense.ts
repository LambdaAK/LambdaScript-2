import { none, some } from "../util/maybe"
import { DefnAST } from "./defn/defn"
import { DefnNode } from "./defn/defnL1"
import { Expr } from "./expr/expr"
import { L9Expr } from "./expr/L9"
import { Pat } from "./pat/Pat"
import { PatL2 } from "./pat/PatL2"
import { Type } from "./type/Type"

/*
  Declare the files
*/

let condenseDefn: (defn: DefnNode) => DefnAST
let condenseExpr: (expr: L9Expr) => Expr
let condensePat: (pat: PatL2) => Pat
let condenseType: (type: TypeL4) => Type

condenseDefn = (defn: DefnNode): DefnAST => {
  return {
    type: "DefnAST",
    pat: condensePat(defn.pat),
    body: condenseExpr(defn.body),
    typeAnnotation: defn.typeAnnotation.type === "None" ? none() : some(condenseType(defn.typeAnnotation.value)),
    defnType: defn.defnType
  }
}

condenseExpr = (expr: L9Expr): Expr => {
  switch (expr.type) {
    case "StringNode":
      return {
        type: "StringAST",
        value: expr.value
      }

    case "NumberNode":
      return {
        type: "NumberAST",
        value: expr.value
      }

    case "BooleanNode":
      return {
        type: "BooleanAST",
        value: expr.value
      }

    case "IdentifierNode":
      return {
        type: "IdentifierAST",
        value: expr.value
      }

    case "NilNode":
      return {
        type: "NilAST"
      }

    case "ApplicationNode":
      return {
        type: "ApplicationAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "TimesNode":
      return {
        type: "TimesAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "DivideNode":
      return {
        type: "DivideAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "PlusNode":
      return {
        type: "PlusAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "MinusNode":
      return {
        type: "MinusAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "RelNode":
      return {
        type: "RelAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right),
        operator: expr.operator
      }

    case "ConjunctionNode":
      return {
        type: "ConjunctionAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "DisjunctionNode":
      return {
        type: "DisjunctionAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "ConsNode":
      return {
        type: "ConsAST",
        left: condenseExpr(expr.left),
        right: condenseExpr(expr.right)
      }

    case "FunctionNode":
      return {
        type: "FunctionAST",
        pattern: condensePat(expr.pattern),
        body: condenseExpr(expr.body),
        typeAnnotation: expr.typeAnnotation.type == 'None' ? none() : some(condenseType(expr.typeAnnotation.value))
      }

    case "IfNode":
      return {
        type: "IfAST",
        condition: condenseExpr(expr.condition),
        thenBranch: condenseExpr(expr.thenBranch),
        elseBranch: condenseExpr(expr.elseBranch)
      }

    case "ParenFactorNode":
      return condenseExpr(expr.node)

    case "BlockNode":
      return {
        type: "BlockAST",
        statements: expr.statements.map((statement) => {
          if (statement.type === "DefnNode") return condenseDefn(statement)
          else return condenseExpr(statement)
        })
      }
  }
}

condensePat = (pat: PatL2): Pat => {
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

condenseType = (type: TypeL4): Type => {
  switch (type.type) {
    case "UnitType":
      return {
        type: "UnitTypeAST"
      }
    case "BoolType":
      return {
        type: "BoolTypeAST"
      }

    case "StringType":
      return {
        type: "StringTypeAST"
      }

    case "IntType":
      return {
        type: "IntTypeAST"
      }

    case "TypeVar":
      return {
        type: "TypeVarAST",
        name: type.name
      }

    case "ParenType":
      return condenseType(type.t)

    case "AppType":
      return {
        type: "AppTypeAST",
        left: condenseType(type.left),
        right: condenseType(type.right)
      }

    case "FunctionType":
      return {
        type: "FunctionTypeAST",
        left: condenseType(type.left),
        right: condenseType(type.right)
      }

    case "PolymorphicType":
      return {
        type: "PolymorphicTypeAST",
        input: type.input,
        output: condenseType(type.output)
      }

    case 'ListType':
      return {
        type: 'ListTypeAST',
        t: condenseType(type.t)
      }


  }
}

export {
  condenseDefn,
  condenseExpr,
  condensePat,
  condenseType
}