import { L9Expr } from "../AST/expr/L9"

type Type = TypeL2
type TypeEquation = [Type, Type]

type Expr = L9Expr

// a mapping from identifiers to types
type StaticEnv = Map<string, Type>

/**
 * Generate type equations for an expression
 * @param expr The expression to generate type equations for
 * @returns A tuple containing the type of the expression and the type equations
 */
export const generate = (expr: Expr, staticEnv: StaticEnv): [Type, TypeEquation[]] => {
  switch (expr.type) {
    case 'NumberNode':
      return [{ type: 'IntType' }, []]
    case 'StringNode':
      return [{ type: 'StringType' }, []]
    case 'BooleanNode':
      return [{ type: 'BoolType' }, []]
    case 'NilNode':
      throw new Error('NilNode not implemented in generate')
    case 'IdentifierNode':
      const type: Type | undefined = staticEnv.get(expr.value)
      if (type === undefined) {
        throw new Error(`Type equation generation failed: identifier ${expr.value} not found in static environment`)
      }
      return [type, []]
    default:
      throw new Error("Type equation generation unimplemented")

  }
}