import { lexAndParse } from '../src/index'

type TestCase = {
  input: string,
  expected: ReturnType<typeof lexAndParse>
}

function objectsEqual(obj1: any, obj2: any): boolean {
  // Check if both arguments are objects
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  // Get keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Compare the number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Compare the keys and their types
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    const type1 = typeof obj1[key];
    const type2 = typeof obj2[key];

    if (type1 !== type2) {
      return false;
    }

    // If the value is an object, recursively compare the structures
    if (type1 === 'object' && !objectsEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
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