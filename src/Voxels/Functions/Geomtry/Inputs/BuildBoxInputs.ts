import { VoxelModelData } from "../../..//Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeomtryLUT.types";
import {
  VoxelBoxGeometryNode,
  VoxelGeometryData,
} from "../../../Geomtry/VoxelGeomtry.types";

import { VoxelFaceNameArray } from "../../../../Math";
import { BuildQuadInputs } from "./BuildQuadInputs";
import { VoxelGeometryTransform } from "../../../../Mesher/Geomtry/Geometry.types";

export function BuildBoxInputs(
  args: any[],
  transform: VoxelGeometryTransform,
  data: VoxelModelInputs,
  box: VoxelBoxGeometryNode,
  model: VoxelModelData,
  geomtry: VoxelGeometryData
) {
  for (const quadFace of VoxelFaceNameArray) {
    const quad = box.faces[quadFace];
    BuildQuadInputs(args, transform, data, quad, model, geomtry);
  }
}
