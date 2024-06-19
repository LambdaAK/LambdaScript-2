export class ImmMap<K, V> {
  private m: [K, V][]
  constructor(map: [K, V][]) {
    this.m = [...map]
  }
  public get(key: K): V | undefined {
    const found = this.m.find(([k, _]) => k === key)
    if (found === undefined) {
      return undefined
    }
    return found[1]
  }
  public set(key: K, value: V): ImmMap<K, V> {
    return new ImmMap([...this.m, [key, value]])
  }
  public delete(key: K): ImmMap<K, V> {
    return new ImmMap(this.m.filter(([k, _]) => k !== key))
  }
  public static union<K, V>(m1: ImmMap<K, V>, m2: ImmMap<K, V>): ImmMap<K, V> {
    return new ImmMap([...m1.m, ...m2.m])
  }

  public map<U>(f: (v: V) => U): ImmMap<K, U> {
    return new ImmMap(this.m.map(([k, v]) => [k, f(v)]))
  }

  public values(): V[] {
    return this.m.map(([_, v]) => v)
  }

}