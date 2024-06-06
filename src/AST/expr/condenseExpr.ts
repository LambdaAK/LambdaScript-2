import { condensePat } from "../pat/condensePat";
import { Expr } from "./expr";
import { L9Expr } from "./L9";


export const condenseExpr = (expr: L9Expr): Expr => {
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
        body: condenseExpr(expr.body)
      }

    case "ParenFactorNode":
      return condenseExpr(expr.node)
  }
}