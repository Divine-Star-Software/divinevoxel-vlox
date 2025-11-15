import { Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import { VoxelShapeShapeDirections } from "../VoxelShape.types";
import {
  IVoxelShapeSelection,
  IVoxelShapeSelectionData,
} from "./VoxelShapeSelection";

export interface PyramidVoxelShapeSelectionData
  extends IVoxelShapeSelectionData<"pyramid-shape"> {
  width: number;
  height: number;
  depth: number;
  fallOff: number;
  direction: VoxelShapeShapeDirections;
}

export class PyramidVoxelShapeSelection
  implements
    IVoxelShapeSelection<"pyramid-shape", PyramidVoxelShapeSelectionData>
{
  static readonly Type = "pyramid-shape";
  static CreateNew(
    data: Partial<PyramidVoxelShapeSelectionData>
  ): PyramidVoxelShapeSelectionData {
    return {
      type: PyramidVoxelShapeSelection.Type,
      origin: data.origin || Vector3Like.Create(),
      bounds: data.bounds || Vector3Like.Create(),
      width: data.width || 6,
      height: data.height || 6,
      depth: data.depth || 6,
      fallOff: data.fallOff || 1,
      direction: data.direction || "+y",
    };
  }
  origin = Vector3Like.Create();
  bounds = new BoundingBox();

  private _fallOff = 0;
  get fallOff() {
    return this._fallOff;
  }
  set fallOff(fallOFf: number) {
    this._fallOff = fallOFf;
  }

  private _direction: VoxelShapeShapeDirections = "+y";
  get direction() {
    return this._direction;
  }
  set direction(direction: VoxelShapeShapeDirections) {
    this._direction = direction;
  }

  _width = 1;
  get width() {
    return this._width;
  }
  set width(width: number) {
    this._width = width;
    this._updateBounds();
  }

  _height = 1;
  get height() {
    return this._height;
  }
  set height(height: number) {
    this._height = height;
    this._updateBounds();
  }

  _depth = 1;
  get depth() {
    return this._depth;
  }
  set depth(depth: number) {
    this._depth = depth;
    this._updateBounds();
  }

  private _updateBounds() {
    this.bounds.setSize(
      Vector3Like.Create(this._width, this._height, this._depth)
    );
  }

  isSelected(x: number, y: number, z: number): boolean {
    let rx = x - this.origin.x;
    let ry = y - this.origin.y;
    let rz = z - this.origin.z;
    if (!this.bounds.intersectsXYZ(rx + 0.5, ry + 0.5, rz + 0.5)) return false;
    switch (this.direction) {
      case "+y": {
        // Pyramid pointing up
        const normalizedFallOff = ry * this.fallOff;
        const minX = normalizedFallOff;
        const minZ = normalizedFallOff;
        const maxX = this.width - normalizedFallOff;
        const maxZ = this.depth - normalizedFallOff;
        if (rx >= minX && rz >= minZ && rx < maxX && rz < maxZ) return true;
        return false;
      }

      case "-y": {
        // Pyramid pointing down
        const normalizedFallOff = (this.height - 1 - ry) * this.fallOff;
        const minX = normalizedFallOff;
        const minZ = normalizedFallOff;
        const maxX = this.width - normalizedFallOff;
        const maxZ = this.depth - normalizedFallOff;
        if (rx >= minX && rz >= minZ && rx < maxX && rz < maxZ) return true;
        return false;
      }

      case "+x": {
        // Pyramid pointing right
        return true;
      }

      case "-x": {
        // Pyramid pointing left
        return true;
      }

      case "+z": {
        // Pyramid pointing forward
        return true;
      }

      case "-z": {
        // Pyramid pointing backward
        return true;
      }

      default:
        return false;
    }
  }

  clone() {
    const newTemplate = new PyramidVoxelShapeSelection();
    newTemplate.fromJSON(this.toJSON());
    return newTemplate;
  }

  toJSON(): PyramidVoxelShapeSelectionData {
    return {
      type: "pyramid-shape",
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
      fallOff: this._fallOff,
      direction: this._direction,
      width: this._width,
      height: this._height,
      depth: this._depth,
    };
  }

  fromJSON(data: PyramidVoxelShapeSelectionData): void {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;
    this._width = data.width;
    this._height = data.height;
    this._depth = data.depth;
    this._direction = data.direction;
    this._fallOff = data.fallOff;
    this._updateBounds();
  }
}
