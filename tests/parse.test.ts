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
  }
]

testCases.forEach(({ input, expected }) => {
  test(input, () => {
    expect(lexAndParse(input)).toEqual(expected)
  })
})