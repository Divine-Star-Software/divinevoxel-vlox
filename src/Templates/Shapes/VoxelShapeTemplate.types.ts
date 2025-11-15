import { PaintVoxelData } from "../../Voxels/Types/PaintVoxelData";
import { IVoxelTemplateData } from "../VoxelTemplates.types";
import { IVoxelShapeSelectionData } from "./Selections/VoxelShapeSelection";
export interface IVoxelShapeTemplateEvents {
  updated: null;
}

export type VoxelShapeTemplateFillModes = "full" | "outline" | "shell";

export const VoxelShapeTemplateFillModesArray: VoxelShapeTemplateFillModes[] = [
  "full",
  "outline",
  "shell",
];

export interface IVoxelshapeTemplateBaseData {
  fillVoxel: PaintVoxelData;
  faceVoxel: PaintVoxelData;
  edgeVoxel: PaintVoxelData;
  pointVoxel: PaintVoxelData;
  fillMode: VoxelShapeTemplateFillModes;
  shapeSelection: IVoxelShapeSelectionData<any>;
}

export interface VoxelShapeTemplateData
  extends IVoxelTemplateData<"shape">,
    IVoxelshapeTemplateBaseData {}
