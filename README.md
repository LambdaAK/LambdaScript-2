# LambdaScript 2 - a Declarative Programming Language inspired by Scala and Haskell

See https://github.com/LambdaAK/LambdaScript

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
