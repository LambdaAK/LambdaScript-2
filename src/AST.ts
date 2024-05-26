type StringNode = {
  type: 'StringNode',
  value: string
}
type NumberNode = {
  type: "NumberNode",
  value: number
}

type BooleanNode = {
  type: "BooleanNode",
  value: boolean
}

type FactorNode = StringNode | NumberNode | BooleanNode

type TimesNode = {
  type: 'TimesNode',
  left: TermNode,
  right: FactorNode
}

type DivideNode = {
  type: 'DivideNode',
  left: TermNode,
  right: FactorNode
}

type TermNode = FactorNode | TimesNode | DivideNode

type PlusNode = {
  type: 'PlusNode',
  left: ArithNode,
  right: TermNode
}

type MinusNode = {
  type: 'MinusNode',
  left: ArithNode,
  right: TermNode
}

type ArithNode = TermNode | PlusNode | MinusNode


const stringOfArithNode = (node: ArithNode): string => {
  if (node.type === 'NumberNode') {
    return node.value.toString()
  }
  if (node.type === 'StringNode') {
    return node.value
  }
  if (node.type === 'TimesNode') {
    return stringOfArithNode(node.left) + "*" + stringOfArithNode(node.right)
  }
  if (node.type === 'DivideNode') {
    return stringOfArithNode(node.left) + "/" + stringOfArithNode(node.right)
  }
  if (node.type === 'PlusNode') {
    return stringOfArithNode(node.left) + "+" + stringOfArithNode(node.right)
  }
  if (node.type === 'MinusNode') {
    return stringOfArithNode(node.left) + "-" + stringOfArithNode(node.right)
  }
  if (node.type === 'BooleanNode') {
    return node.value.toString()
  }

  throw new Error('Unreachable in stringOfArithNode')
}

export {
  StringNode,
  NumberNode,
  FactorNode,
  TimesNode,
  DivideNode,
  TermNode,
  PlusNode,
  MinusNode,
  ArithNode,
  stringOfArithNode,
  BooleanNode
}