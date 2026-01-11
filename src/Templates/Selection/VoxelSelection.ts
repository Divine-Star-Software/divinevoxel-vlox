import { Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

export interface IVoxelSelection<
  Type extends string = "",
  Data extends IVoxelSelectionData<Type> = any
> {
  origin: Vector3Like;
  bounds: BoundingBox;
  isSelected(x: number, y: number, z: number): boolean;
  clone(): IVoxelSelection;
  toJSON(): Data;
  fromJSON(data: Data): void;
}

export interface IVoxelSelectionData<Type extends string> {
  type: Type;
  origin: Vector3Like;
  bounds: Vector3Like;
}

export interface IVoxelSelectionConstructor<
  Type extends string,
  Data extends IVoxelSelectionData<Type> = any
> {
  new (): IVoxelSelection<Type, Data>;
}
