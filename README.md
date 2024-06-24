# LambdaScript 2 - a Declarative Programming Language inspired by Scala and Haskell

## Foreword

Hello, a thank you for taking the time to look at LambdaScript 2.

In May 2023, I began working on [LambdaScript](https://github.com/LambdaAK/LambdaScript), an interpreter for a functional programming language. I worked on the project for about a year, and I had a lot of fun working on it. However, I eventually realized that there were some fundamental issues with the project's architecture, and decided to start over from scratch.

LambdaScript 2 is the result of that decision. Currently, LambdaScript 2 has a lexer, parser, and type checker for some of the fundamental language features. I plan to add many more language features, implement a compiler to JavaScript, write a VSCode extension, and make a website for it.

-Alex

# Example Programs

```scala
50 + 100 * 10 - 1
```

```scala
{
  val x : Int = 10;
  val y : Int = 20;
  x + y
}
```


```scala
(a : Int) =>
(b : Bool) =>
(c : Int) =>
  if b then a else c
```

```scala
a =>
b =>
c =>
d => {
  val x = a;
  val y = b;
  val z = c;
  val w = d;
  x + y + z + w;
}
```

```scala
1 :: 2 :: 3 :: 4 :: 5 :: []
```
