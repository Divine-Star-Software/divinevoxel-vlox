import { Flat3DIndex, Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import { RawVoxelData } from "../Voxels/Types/Voxel.types";

export interface IVoxelTemplate<
  Type extends string = "",
  Data extends IVoxelTemplateData<Type> = any
> {
  bounds: BoundingBox;
  index: Flat3DIndex;
  getIndex(x: number, y: number, z: number): number;
  isAir(index: number): boolean;
  isIncluded(index: number): boolean;
  inBounds(x: number, y: number, z: number): boolean;
  getId(index: number): number;
  getLevel(index: number): number;
  getLight(index: number): number;
  getSecondary(index: number): number;
  clone(): IVoxelTemplate;
  getRaw(index: number, rawRef?: RawVoxelData): RawVoxelData;
  toJSON(): Data;
  fromJSON(data: Data): void;
}

export interface IVoxelTemplateData<Type extends string> {
  type: Type;
  bounds: Vector3Like;
}

export interface IVoxelTemplateConstructor<
  Type extends string,
  Data extends IVoxelTemplateData<Type> = any
> {
  new (data: Data): IVoxelTemplate<Type, Data>;
}
