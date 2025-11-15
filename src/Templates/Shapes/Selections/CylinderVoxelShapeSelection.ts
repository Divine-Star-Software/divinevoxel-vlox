import { Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import {
  IVoxelShapeSelection,
  IVoxelShapeSelectionData,
} from "./VoxelShapeSelection";

export interface CylinderVoxelShapeSelectionData
  extends IVoxelShapeSelectionData<"cylinder-shape"> {
  width: number;
  height: number;
  depth: number;
}

export class CylinderVoxelShapeSelection
  implements
    IVoxelShapeSelection<"cylinder-shape", CylinderVoxelShapeSelectionData>
{
  static readonly Type = "cylinder-shape";
  static CreateNew(
    data: Partial<CylinderVoxelShapeSelectionData>
  ): CylinderVoxelShapeSelectionData {
    return {
      type: CylinderVoxelShapeSelection.Type,
      origin: data.origin || Vector3Like.Create(),
      bounds:
        data.bounds ||
        Vector3Like.Create(data.width || 1, data.height || 1, data.depth || 1),
      width: data.width || 1,
      height: data.height || 1,
      depth: data.depth || 1,
    };
  }
  origin = Vector3Like.Create();
  bounds = new BoundingBox();
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
    return true;
  }

  clone() {
    const newTemplate = new CylinderVoxelShapeSelection();
    newTemplate.fromJSON(this.toJSON());
    return newTemplate;
  }

  toJSON(): CylinderVoxelShapeSelectionData {
    return {
      type: CylinderVoxelShapeSelection.Type,
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
      width: this._width,
      height: this._height,
      depth: this._depth,
    };
  }

  fromJSON(data: CylinderVoxelShapeSelectionData): void {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;
    this._width = data.width;
    this._height = data.height;
    this._depth = data.depth;
    this._updateBounds();
  }
}
