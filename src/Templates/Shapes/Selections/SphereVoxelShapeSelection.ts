import { Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import {
  IVoxelShapeSelection,
  IVoxelShapeSelectionData,
} from "./VoxelShapeSelection";

export interface SphereVoxelShapeSelectionData
  extends IVoxelShapeSelectionData<"sphere-shape"> {
  radius: number;
}

export class SphereVoxelShapeSelection
  implements
    IVoxelShapeSelection<"sphere-shape", SphereVoxelShapeSelectionData>
{
  static readonly Type = "sphere-shape";
  static CreateNew(
    data: Partial<SphereVoxelShapeSelectionData>
  ): SphereVoxelShapeSelectionData {
    return {
      type: SphereVoxelShapeSelection.Type,
      origin: data.origin || Vector3Like.Create(),
      bounds: data.bounds || Vector3Like.Create(),
      radius: data.radius || 2,
    };
  }
  origin = Vector3Like.Create();
  bounds = new BoundingBox();

  _radius = 1;
  get radius() {
    return this._radius;
  }
  set radius(radius: number) {
    this._radius = radius;
    this._updateBounds();
  }

  private _updateBounds() {
    this.bounds.setSize(
      Vector3Like.Create(
        this._radius * 2 + 1,
        this._radius * 2 + 1,
        this._radius * 2 + 1
      )
    );
  }

  isSelected(x: number, y: number, z: number): boolean {
    let rx = x - this.origin.x;
    let ry = y - this.origin.y;
    let rz = z - this.origin.z;
    if (!this.bounds.intersectsXYZ(rx + 0.5, ry + 0.5, rz + 0.5)) return false;
    const cx = Math.floor(this.bounds.size.x / 2);
    const cy = Math.floor(this.bounds.size.y / 2);
    const cz = Math.floor(this.bounds.size.z / 2);

    const normX = (rx - cx) / this.radius;
    const normY = (ry - cy) / this.radius;
    const normZ = (rz - cz) / this.radius;
    const distance = Math.sqrt(normX * normX + normY * normY + normZ * normZ);

    return distance <= 1;
  }

  clone() {
    const newTemplate = new SphereVoxelShapeSelection();
    newTemplate.fromJSON(this.toJSON());
    return newTemplate;
  }

  toJSON(): SphereVoxelShapeSelectionData {
    return {
      type: "sphere-shape",
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
      radius: this._radius,
    };
  }

  fromJSON(data: SphereVoxelShapeSelectionData): void {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;

    this.radius = data.radius;

    this._updateBounds();
  }
}
