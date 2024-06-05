export class ImmMap<K, V> {
  private map: [K, V][]
  constructor(map: [K, V][]) {
    this.map = [...map]
  }
  public get(key: K): V | undefined {
    const found = this.map.find(([k, _]) => k === key)
    if (found === undefined) {
      return undefined
    }
    return found[1]
  }
  public set(key: K, value: V): ImmMap<K, V> {
    return new ImmMap([...this.map, [key, value]])
  }
  public delete(key: K): ImmMap<K, V> {
    return new ImmMap(this.map.filter(([k, _]) => k !== key))
  }
  public static union<K, V>(m1: ImmMap<K, V>, m2: ImmMap<K, V>): ImmMap<K, V> {
    return new ImmMap([...m1.map, ...m2.map])
  }

}