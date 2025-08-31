import { Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";

export interface IVoxelSelection {
  origin: Vector3Like;
  size: Vector3Like;
  bounds: BoundingBox;
  isSelected(x: number, y: number, z: number): boolean;
  clone(): IVoxelSelection;
}
