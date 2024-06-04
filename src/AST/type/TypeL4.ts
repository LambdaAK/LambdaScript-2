
type PolymorphicType = {
  type: 'PolymorphicType',
  input: string, // the name of the argument that is taken
  output: TypeL4 // the type that is returned
}

type TypeL4 = PolymorphicType | TypeL3