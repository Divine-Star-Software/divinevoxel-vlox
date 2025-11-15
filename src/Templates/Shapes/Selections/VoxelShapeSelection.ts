import {
  IVoxelSelection,
  IVoxelSelectionData,
} from "../../Selection/VoxelSelection";
export interface IVoxelShapeSelectionData<Type extends string>
  extends IVoxelSelectionData<Type> {}

export interface IVoxelShapeSelection<
  Type extends string,
  Data extends IVoxelShapeSelectionData<Type>
> extends IVoxelSelection<Type, Data> {}
