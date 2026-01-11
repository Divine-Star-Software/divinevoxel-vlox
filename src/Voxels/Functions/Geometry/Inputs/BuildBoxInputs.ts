import { VoxelModelData } from "../../..//Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeometryLUT.types";
import {
  VoxelBoxGeometryNode,
  VoxelGeometryData,
} from "../../../Geometry/VoxelGeometry.types";

import { VoxelFaceNameArray } from "../../../../Math";
import { BuildQuadInputs } from "./BuildQuadInputs";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";

export function BuildBoxInputs(
  args: any[],
  transform: VoxelGeometryTransform,
  data: VoxelModelInputs,
  box: VoxelBoxGeometryNode,
  model: VoxelModelData,
  geometry: VoxelGeometryData
) {
  for (const quadFace of VoxelFaceNameArray) {
    const quad = box.faces[quadFace];
    BuildQuadInputs(args, transform, data, quad, model, geometry);
  }
}
