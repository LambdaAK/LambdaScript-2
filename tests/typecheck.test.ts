/*
  Parse an expression and get the type
  Check if the type is what we expect
*/

import { lexAndParseExpr } from "../src"
import { stringOfType } from "../src/AST/type/Type"
import { typeOfExpr, fixType, generalizeTypeVars } from "../src/typecheck/typecheck"

type TestCase = {
  input: string,
  expected: string
}

const intTestModifier1 = (input: TestCase) => {
  return {
    input: `(${input.input}) + 1`,
    expected: 'Int'
  }
}

const intTestModifier2 = (input: TestCase) => {
  return {
    input: `(${input.input}) + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10`,
    expected: 'Int'
  }
}

const intTestModifier3 = (input: TestCase) => {
  return {
    input: `(${input.input}) + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16`,
    expected: 'Int'
  }
}

const intTestModifier4 = (input: TestCase) => {
  return {
    input: `(${input.input}) + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20`,
    expected: 'Int'
  }
}

const intTestModifier = (input: TestCase) => {
  return [
    intTestModifier1(input),
    intTestModifier2(input),
    intTestModifier3(input),
    intTestModifier4(input)
  ]
}

const typeTestModifier1 = (input: TestCase) => input

const typeTestModifier2 = (input: TestCase) => {
  return {
    input: `(${input.input})`,
    expected: input.expected
  }
}

const typeTestModifier3 = (input: TestCase) => {
  return {
    input: `if True then ${input.input} else ${input.input}`,
    expected: input.expected
  }
}

const typeTestModifier4 = (input: TestCase) => {
  return {
    input: `{(${input.input});}`,
    expected: input.expected
  }
}

const typeTestModifier5 = (input: TestCase) => {
  return {
    input: `match 0 with {
      case _ => ${input.input};
    }`,
    expected: input.expected
  }
}

const typeTestModifiers = [
  typeTestModifier1,
  typeTestModifier2,
  typeTestModifier3,
  typeTestModifier4,
  typeTestModifier5
]

const typeTestModifier = (input: TestCase) => typeTestModifiers.map(modifier => modifier(input))


const arithTests1: TestCase[] = 
[
  "1 + 1 - 1 + 2 - 3 + 4 - 5 + 6 - 7 + 8 - 9 + 10",
  "1 + 2 - 3 + 4 - 5 + 6 - 7 + 8 - 9 + 10 - 11 + 12 - 13 + 14 - 15 + 16",
  "2 - 1 + 3 - 2 + 4 - 3 + 5 - 4 + 6 - 5 + 7 - 6 + 8 - 7 + 9 - 8 + 10",
  "3 + 3 - 1 + 1 - 4 + 4 - 2 + 2 - 5 + 5 - 3 + 3 - 6 + 6 - 4 + 4 - 7 + 7",
  "4 - 1 + 2 - 3 + 4 - 5 + 6 - 7 + 8 - 9 + 10 - 11 + 12 - 13 + 14 - 15 + 16 - 17 + 18 - 19 + 20",
  "5 + 1 - 2 + 3 - 4 + 5 - 6 + 7 - 8 + 9 - 10 + 11 - 12 + 13 - 14 + 15 - 16 + 17 - 18 + 19 - 20",
  "6 - 1 + 1 - 2 + 2 - 3 + 3 - 4 + 4 - 5 + 5 - 6 + 6 - 7 + 7 - 8 + 8 - 9 + 9 - 10 + 10 - 11 + 11 - 12 + 12 - 13 + 13 - 14 + 14 - 15 + 15 - 16 + 16 - 17 + 17 - 18 + 18 - 19 + 19 - 20",
  "7 + 1 - 2 + 3 - 4 + 5 - 6 + 7 - 8 + 9 - 10 + 11 - 12 + 13 - 14 + 15 - 16 + 17 - 18 + 19 - 20 + 21 - 22 + 23 - 24 + 25 - 26 + 27 - 28 + 29 - 30",
  "8 - 1 + 1 - 2 + 2 - 3 + 3 - 4 + 4 - 5 + 5 - 6 + 6 - 7 + 7 - 8 + 8 - 9 + 9 - 10 + 10 - 11 + 11 - 12 + 12 - 13 + 13 - 14 + 14 - 15 + 15 - 16 + 16 - 17 + 17 - 18 + 18 - 19 + 19 - 20 + 20 - 21 + 21 - 22 + 22 - 23 + 23 - 24 + 24 - 25 + 25 - 26 + 26 - 27 + 27 - 28 + 28 - 29 + 29 - 30 + 30",
  "9 + 1 - 2 + 3 - 4 + 5 - 6 + 7 - 8 + 9 - 10 + 11 - 12 + 13 - 14 + 15 - 16 + 17 - 18 + 19 - 20 + 21 - 22 + 23 - 24 + 25 - 26 + 27 - 28 + 29 - 30 + 31 - 32 + 33 - 34 + 35 - 36 + 37 - 38 + 39 - 40",
  "10 - 1 + 1 - 2 + 2 - 3 + 3 - 4 + 4 - 5 + 5 - 6 + 6 - 7 + 7 - 8 + 8 - 9 + 9 - 10 + 10 - 11 + 11 - 12 + 12 - 13 + 13 - 14 + 14 - 15 + 15 - 16 + 16 - 17 + 17 - 18 + 18 - 19 + 19 - 20 + 20 - 21 + 21 - 22 + 22 - 23 + 23 - 24 + 24 - 25 + 25 - 26 + 26 - 27 + 27 - 28 + 28 - 29 + 29 - 30 + 30 - 31 + 31 - 32 + 32 - 33 + 33 - 34 + 34 - 35 + 35 - 36 + 36 - 37 + 37 - 38 + 38 - 39 + 39 - 40 + 40",
  "11 + 2 - 4 + 6 - 8 + 10 - 12 + 14 - 16 + 18 - 20 + 22 - 24 + 26 - 28 + 30 - 32 + 34 - 36 + 38 - 40 + 42 - 44 + 46 - 48 + 50",
  "12 - 1 + 2 - 3 + 4 - 5 + 6 - 7 + 8 - 9 + 10 - 11 + 12 - 13 + 14 - 15 + 16 - 17 + 18 - 19 + 20 - 21 + 22 - 23 + 24 - 25 + 26 - 27 + 28 - 29 + 30 - 31 + 32 - 33 + 34 - 35 + 36 - 37 + 38 - 39 + 40 - 41 + 42 - 43 + 44 - 45 + 46 - 47 + 48 - 49 + 50",
  "13 + 1 - 2 + 3 - 4 + 5 - 6 + 7 - 8 + 9 - 10 + 11 - 12 + 13 - 14 + 15 - 16 + 17 - 18 + 19 - 20 + 21 - 22 + 23 - 24 + 25 - 26 + 27 - 28 + 29 - 30 + 31 - 32 + 33 - 34 + 35 - 36 + 37 - 38 + 39 - 40 + 41 - 42 + 43 - 44 + 45 - 46 + 47 - 48 + 49 - 50 + 51",
  "14 - 1 + 1 - 2 + 2 - 3 + 3 - 4 + 4 - 5 + 5 - 6 + 6 - 7 + 7 - 8 + 8 - 9 + 9 - 10 + 10 - 11 + 11 - 12 + 12 - 13 + 13 - 14 + 14 - 15 + 15 - 16 + 16 - 17 + 17 - 18 + 18 - 19 + 19 - 20 + 20 - 21 + 21 - 22 + 22 - 23 + 23 - 24 + 24 - 25 + 25 - 26 + 26 - 27 + 27 - 28 + 28 - 29 + 29 - 30 + 30 - 31 + 31 - 32 + 32 - 33 + 33 - 34 + 34 - 35 + 35 - 36 + 36 - 37 + 37 - 38 + 38 - 39 + 39 - 40 + 40 - 41 + 41 - 42 + 42 - 43 + 43 - 44 + 44 - 45 + 45 - 46 + 46 - 47 + 47 - 48 + 48 - 49 + 49 - 50 + 50 - 51 + 51",
]
.map(input => {
  return {
    input,
    expected: 'Int'
  }
})
.flatMap(intTestModifier)
.flatMap(intTestModifier)

const unitTypeTests: TestCase[] = [
  "()",
  "(())",
  "((()))",
  "(((())))",
  "((((()))))",
  "(((((())))))",
  "((((((()))))))",
  "{();}",
  "({({({({({();});});});});})",
  "({({({({({(({({({({({(({({({({({();});});});});}));});});});});}));});});});});})",
  "({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({();});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});})"
]
.map(input => {
  return {
    input,
    expected: 'Unit'
  }
})

const arithTests2: TestCase[] = [
  `{
    val x = 1;
    x;
  }`,
  `{
    val x = 1;
    val y = 2;
    x + y;
  }`,
  `{
    val a = 1;
    val b = 2;
    val c = a + b;
    val d = c + 3;
    val e = d - 1;
    e * 2;
  }`,
  `{
    val a = 5;
    val b = 10;
    val c = a * b;
    val d = c - a;
    val e = d / 2;
    val f = e + 3;
    f - 1;
  }`,
  `{
    val x = 10;
    val y = 20;
    val z = 30;
    val result = x + y - z * x / y + z;
    val finalResult = result + 5 - x;
    finalResult;
  }`,
  `{
    val p = 3;
    val q = 4;
    val r = 5;
    val s = p * q + r - p;
    val t = s + q - r * p / q;
    val u = t + 1;
    u - 2;
  }`,
  `{
    val i = 2;
    val j = 3;
    val k = 4;
    val l = 5;
    val m = i + j - k * l + j;
    val n = m / i + k - l;
    val o = n * 2;
    o + 3;
  }`,
  `{
    val a = 6;
    val b = 7;
    val c = 8;
    val d = 9;
    val e = a * b + c - d;
    val f = e / b + c * a - d;
    val g = f + 10;
    g - 5;
  }`,
  `{
    val x = 1;
    val y = x + 1;
    val z = y + 2;
    val result = x + y + z;
    val finalResult = result * 2;
    finalResult - 1;
  }`,
  `{
    val a = 4;
    val b = 3;
    val c = 2;
    val d = 1;
    val result = a * b + c - d / a + b;
    val finalResult = result + 10;
    finalResult / 2;
  }`,
  `{
    val u = 7;
    val v = 6;
    val w = 5;
    val x = 4;
    val y = 3;
    val z = 2;
    val result = u - v + w * x / y - z;
    val finalResult = result + 5;
    finalResult - 3;
  }`,
  `{
    val m = 10;
    val n = 9;
    val o = 8;
    val p = 7;
    val q = 6;
    val r = 5;
    val s = 4;
    val t = 3;
    val u = 2;
    val v = 1;
    val result = m - n + o * p / q - r + s - t + u - v;
    val finalResult = result * 2;
    finalResult - 5;
  }`,
  `{
    val a = 12;
    val b = 11;
    val c = 10;
    val d = 9;
    val e = 8;
    val f = 7;
    val g = 6;
    val h = 5;
    val i = 4;
    val j = 3;
    val k = 2;
    val l = 1;
    val result = a - b + c * d / e - f + g - h + i - j + k - l;
    val finalResult = result + 15;
    finalResult / 3;
  }`,
  `{
    val a = 1;
    val b = 1;
    val c = a + b;
    val d = c + 2;
    val e = d * 3;
    val f = e / 4;
    val g = f - 5;
    val h = g + 6;
    val result = h - 7;
    val finalResult = result * 2;
    finalResult / 3;
  }`,
  `{
    val x = 1;
    val y = 2;
    val z = 3;
    val a = 4;
    val b = 5;
    val c = x + y + z + a + b;
    val d = c * x - y / z + a - b;
    val e = d + 10;
    e - 2;
  }`
]
.map(input => {
  return {
    input,
    expected: 'Int'
  }
})

const relBoolTypeTests = [
  "1 < 2",
  "1 > 2",
  "1 <= 2",
  "1 >= 2",
  "1 == 2",
  "1 != 2"
]
.map(input => {
  return {
    input,
    expected: 'Bool'
  }
})

const moreComplexIntTypeTests = [
  "if True then 1 else 2",
  "if False then 1 else 2",
  `if True then 1 else 2 + 3`,
  `{
    val x = True;
    if x then 1 else 2;
  }`,
  `
  {
    val x = True;
    val y = False;
    val z = if x then 1 else 2;
    val a = if y then 3 else 4;
    val b = z + a;
    val c = b + 5;
    c;
  }
  `,
  `
  {
    val x = 1;
    val y = 2;
    val z = 3;
    val a = 4;
    val b = 5;
    val c = x + y + z + a + b;
    val d = c * x - y / z + a - b;
    val e = d + 10;
    val f = e - 2;
    val g = if f < 10 then 1 else 0;
    g;
  }
  `,
  "({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(({({({({({(2);});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});}));});});});});})"
]
.map(input => {
  return {
    input,
    expected: 'Int'
  }
})

const stringTypeTests: TestCase[] = [
  `""`,
  `"hello"`,
  `"world"`,
  `"a a a a a a a a ahgkleakl gaefkaj eflk aeflk aeflk jaeglkh aeglkhaeglkh aeg"`
]
.map(input => {
  return {
    input,
    expected: 'String'
  }
})

const listTypeTests: TestCase[] = [
  {
    input: "[]",
    expected: "a . [a]"
  },
  {
    input: "1 :: []",
    expected: "[Int]"
  },
  {
    input: "1 :: 2 :: []",
    expected: "[Int]"
  },
  {
    input: "1 :: 2 :: 3 :: []",
    expected: "[Int]"
  },
  {
    input: "1 :: 2 :: 3 :: 4 :: []",
    expected: "[Int]"
  },
  {
    input: "1 :: 2 :: 3 :: 4 :: 5 :: []",
    expected: "[Int]"
  },
  {
    input: "[] :: []",
    expected: "a . [[a]]"
  },
  {
    input: "([] :: []) :: []",
    expected: "a . [[[a]]]"
  },
  {
    input: "(([] :: []) :: []) :: []",
    expected: "a . [[[[a]]]]"
  }

]

const functionTypeTests: TestCase[] = [
   {
    input: "x => x",
    expected: "a . a -> a"
   },
   {
    input: "x => x + 1",
    expected: "Int -> Int"
   },
   {
    input: "x => x + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10",
    expected: "Int -> Int"
   },
   // multiple layers of functions
   {
    input: "x => y => x + y",
    expected: "Int -> Int -> Int"
   },
   {
    input: "x => y => z => x + y + z",
    expected: "Int -> Int -> Int -> Int"
   },
   {
    input: "x => y => z => a => b => c => d => e => f => g => x + y + z + a + b + c + d + e + f + g",
    expected: "Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int"
   },
   {
    input: "x => y => z => a => b => c => d => e => f => g => x + y + z + a + b + c + d + e + f + g + 1",
    expected: "Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int"
   },
   {
    input: "x => y => z => a => b => c => d => e => f => g => x + y + z + a + b + c + d + e + f + g + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10",
    expected: "Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int -> Int"
   },
   {
    input: "a => b => c => if a then b else c",
    expected: "a . Bool -> a -> a -> a"
   },
   {
    input: "(a : Int) => b => (c : Int) => if b then a else c",
    expected: "Int -> Bool -> Int -> Int"
   },
    {
      input: "(a : Int) => (b : Bool) => (c : Int) => if b then a else c",
      expected: "Int -> Bool -> Int -> Int"
    },
    {
      input: "(a : Int) => (b : Bool) => (c : Int) => if b then a else c + 1",
      expected: "Int -> Bool -> Int -> Int"
    },
    {
      input: "(a : Int) => (b : Bool) => (c : Int) => if b then a else c + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10",
      expected: "Int -> Bool -> Int -> Int"
    },
    {
      input: "(a : Int) => (b : Bool) => (c : Int) => if b then a else c + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16",
      expected: "Int -> Bool -> Int -> Int"
    },
    {
      input: "(a : Int) => (b : Bool) => (c : Int) => if b then a else c + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20",
      expected: "Int -> Bool -> Int -> Int"
    },
    {
      input: "(a : Int) => (b : Bool) => (c : Int) => if b then a else c + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20 + 21 + 22 + 23 + 24 + 25 + 26 + 27 + 28 + 29 + 30",
      expected: "Int -> Bool -> Int -> Int"
    },
    {
      input: `a => { val x = a; x; }`,
      expected: "a . a -> a"
    },
    {
      input: `a => b => { val x = a; val y = b; x + y; }`,
      expected: "Int -> Int -> Int"
    },
    {
      input: `a => b => c => { val x = a; val y = b; val z = c; x + y + z; }`,
      expected: "Int -> Int -> Int -> Int"
    },
    {
      input: `a => b => c => d => { val x = a; val y = b; val z = c; val w = d; x + y + z + w; }`,
      expected: "Int -> Int -> Int -> Int -> Int"
    }
]

const complexTests1: TestCase[] = [
  {
    input: `{val x : Int = 1;val y : Int -> Int = x => x + 1;y x;}`,
    expected: "Int"
  },
  {
    input: `{
      val x : Int = 1;
      val u: Unit = ();
      val y : Int -> Int = x => x + 1;
      y;
    }`,
    expected: "Int -> Int"
  },
  {
    input: `{
      val x = {
        val y = 1;
        val z = 2;
        y + z;
      };
      val a : Int = 3;
      x + a;
    }`,
    expected: "Int"
  },
  {
    input: `{
      val f = (x : Int) => (y : Int) => x + y;
      f 1; 
    }`,
    expected: "Int -> Int"
  },
  {
    input: `{
      val a = 1;
      val b = 2;
      val c = 3;
      val d = 4;
      val e = 5;
      val f = aa => bb => cc => dd => ee => aa + bb + cc + dd + ee;
      f a b c d e;
    }`,
    expected: "Int"
  },
  {
    input: `{
      val a = 1;
      val b = 2 + a;
      val c = 3 + a + a + a + a * 2 * b;
      val d = {
        val c : Unit = ();
        5;
      };
      val e = {
        val z = 5;
        z;
      };
      val f = aa => bb => cc => dd => ee => aa + bb + cc + dd + ee;
      f a b c d e;
    }`,
    expected: "Int"
  }
]

const switchTests: TestCase[] = [
  {
    input: `match 1 + 1 with {
      case 1 => 1;
      case 2 => 2;
      case 3 => 3;
      case 4 => 4;
      case 5 => 5;
    }`,
    expected: "Int"
  },
  {
    input: `match [] with {
      case [] => True;
      case _ :: _ => False;
    }`,
    expected: "Bool"
  },
  {
    input: `match [] with {
      case [] => ();
      case _ => ();
    }`,
    expected: "Unit"
  },
  {
    input: `match 1 + 1 with {
      case x => x;
    }`,
    expected: "Int"
  },
  {
    input: `match 1 + 1 with {
      case x => {
        val isLess = x < 2;
        if isLess then True else False;
      };
    }`,
    expected: "Bool"
  }
]

const runTest = (input: string, expected: string) => {
  const ast = lexAndParseExpr(input)
  const type = typeOfExpr(ast)
  expect(stringOfType(fixType(generalizeTypeVars(type)))).toEqual(expected)
}

const testCases = arithTests1.concat(arithTests2, moreComplexIntTypeTests, relBoolTypeTests, functionTypeTests, complexTests1, unitTypeTests, stringTypeTests, listTypeTests, switchTests).flatMap(typeTestModifier)



testCases.forEach(({ input, expected }) => {  
  test(input, () => {
    runTest(input, expected)
  })
})