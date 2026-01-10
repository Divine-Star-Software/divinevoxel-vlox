import {
  VoxelGeometryLinkData,
  VoxelModelData,
} from "../../..//Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeomtryLUT.types";
import { VoxelGeometryData } from "../../../Geomtry/VoxelGeomtry.types";

import { BuildQuadInputs } from "./BuildQuadInputs";
import { BuildBoxInputs } from "./BuildBoxInputs";
import { BuildTriangleInputs } from "./BuildTriangleInputs";
import { BuildCustomInputs } from "./BuildCustomInputs";

export function BuildInputs(
  link: VoxelGeometryLinkData,
  data: VoxelModelInputs,
  model: VoxelModelData,
  geomtry: VoxelGeometryData
) {
  const args: any[] = [];
  for (const node of geomtry.nodes) {
    if (node.type == "box") {
      BuildBoxInputs(args, link, data, node, model, geomtry);
    }
    if (node.type == "quad") {
      BuildQuadInputs(args, link, data, node, model, geomtry);
    }
    if (node.type == "triangle") {
      BuildTriangleInputs(args, link, data, node, model, geomtry);
    }
    if (node.type == "custom") {
      BuildCustomInputs(args, link, data, node, model, geomtry);
    }
  }

  return args;
}
