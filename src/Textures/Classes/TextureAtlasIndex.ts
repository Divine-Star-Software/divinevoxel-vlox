import { Vec2Array } from "@amodx/math";

export class TextureAtlasIndex {
  bounds: Vec2Array = [0, 0];

  setBounds(bounds: Vec2Array) {
    this.bounds = bounds;
  }

  getIndex(x: number, y: number) {
    return x + y * this.bounds[0];
  }

  getPosition(index: number, position: Vec2Array = [0, 0]) {
    position[0] = Math.floor(index % this.bounds[0]);
    position[1] = Math.floor(index / this.bounds[0]);
    return position;
  }
}
