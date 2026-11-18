

export class StringPalette {
  private _count = 0;
  _palette: string[] = [];
  _map: Record<string, number> = {};

  constructor(initial?: ArrayLike<string>) {
    if (initial) {
      const length = initial.length;
      for (let i = 0; i < length; i++) {
        this.register(initial[i]);
      }
    }
  }
  get size() {
    return this._count;
  }

  load(palette: string[]) {
    this._palette = [];
    this._map = {};
    const length = palette.length;
    for (let i = 0; i < length; i++) {
      this.register(palette[i]);
    }
  }

  register(string: string) {
    if(this._map[string] !== undefined) return this._map[string];
    const id = this._count;
    this._count++;
    this._palette[id] = string;
    this._map[string] = id;
    return id;
  }

  get() {
    return this._palette;
  }
  getMap() {
    return this._map;
  }

  isRegistered(id: string) {
    return this._map[id] !== undefined;
  }

  getNumberId(id: string) {
    return this._map[id];
  }
  getStringId(id: number) {
    return this._palette[id];
  }
}
