import { Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import {
  IVoxelShapeSelection,
  IVoxelShapeSelectionData,
} from "./VoxelShapeSelection";

export interface EllipsoidVoxelShapeSelectionData
  extends IVoxelShapeSelectionData<"ellipsoid-shape"> {
  radiusX: number;
  radiusY: number;
  radiusZ: number;
}

export class EllipsoidVoxelShapeSelection
  implements
    IVoxelShapeSelection<"ellipsoid-shape", EllipsoidVoxelShapeSelectionData>
{
  static readonly Type = "ellipsoid-shape";
  static CreateNew(
    data: Partial<EllipsoidVoxelShapeSelectionData>
  ): EllipsoidVoxelShapeSelectionData {
    return {
      type: EllipsoidVoxelShapeSelection.Type,
      origin: data.origin || Vector3Like.Create(),
      bounds: data.bounds || Vector3Like.Create(),
      radiusX: data.radiusX || 5,
      radiusY: data.radiusY || 5,
      radiusZ: data.radiusZ || 5,
    };
  }
  origin = Vector3Like.Create();
  bounds = new BoundingBox();

  private _radiusX = 0;
  get radiusX() {
    return this._radiusX;
  }
  set radiusX(radius: number) {
    const oldRadius = this._radiusX;

    this._radiusX = radius;
    if (oldRadius != radius) {
      this._updateBounds();
    }
  }

  private _radiusY = 0;
  get radiusY() {
    return this._radiusY;
  }
  set radiusY(radius: number) {
    const oldRadius = this._radiusY;
    this._radiusY = radius;
    if (oldRadius != radius) {
      this._updateBounds();
    }
  }

  private _radiusZ = 0;
  get radiusZ() {
    return this._radiusZ;
  }
  set radiusZ(radius: number) {
    const oldRadius = this._radiusZ;
    this._radiusZ = radius;
    if (oldRadius != radius) {
      this._updateBounds();
    }
  }

  private _updateBounds() {
    this.bounds.setSize(
      Vector3Like.Create(
        this._radiusX * 2 + 1,
        this._radiusY * 2 + 1,
        this._radiusZ * 2 + 1
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

    const normX = (rx - cx) / this.radiusX;
    const normY = (ry - cy) / this.radiusY;
    const normZ = (rz - cz) / this.radiusZ;
    const distance = Math.sqrt(normX * normX + normY * normY + normZ * normZ);

    return distance <= 1;
  }

  clone() {
    const newTemplate = new EllipsoidVoxelShapeSelection();
    newTemplate.fromJSON(this.toJSON());
    return newTemplate;
  }

  toJSON(): EllipsoidVoxelShapeSelectionData {
    return {
      type: "ellipsoid-shape",
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
      radiusX: this._radiusX,
      radiusY: this._radiusY,
      radiusZ: this._radiusZ,
    };
  }

  fromJSON(data: EllipsoidVoxelShapeSelectionData): void {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;

    this._radiusX = data.radiusX;
    this._radiusY = data.radiusY;
    this._radiusZ = data.radiusZ;

    this._updateBounds();
  }
}
