import { lexAndParse } from '../src/index'

type TestCase = {
  input: string,
  expected: ReturnType<typeof lexAndParse>
}

const testCases: TestCase[] = [
  {
    input: '1 + 1',
    expected: {
      type: 'Some',
      value: {
        type: 'PlusNode',
        left: { type: 'NumberNode', value: 1 },
        right: { type: 'NumberNode', value: 1 }
      }
    }
  },
  {
    input: "1 + 2 + 3",
    expected: {
      type: 'Some',
      value: {
        type: 'PlusNode',
        left: {
          type: 'PlusNode',
          left: { type: 'NumberNode', value: 1 },
          right: { type: 'NumberNode', value: 2 }
        },
        right: { type: 'NumberNode', value: 3 }
      }
    }
  },
  {
    input: "a * b + c",
    expected: {
      type: 'Some',
      value: {
        type: 'PlusNode',
        left: {
          type: 'TimesNode',
          left: { type: 'IdentifierNode', value: 'a' },
          right: { type: 'IdentifierNode', value: 'b' }
        },
        right: { type: 'IdentifierNode', value: 'c' }
      }
    }
  },

]

testCases.forEach(({ input, expected }) => {
  test(input, () => {
    expect(lexAndParse(input)).toEqual(expected)
  })
})