import {
  VoxelGeometryLinkData,
  VoxelModelData,
} from "../../..//Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeometryLUT.types";
import { VoxelGeometryData } from "../../../Geometry/VoxelGeometry.types";

import { BuildQuadInputs } from "./BuildQuadInputs";
import { BuildBoxInputs } from "./BuildBoxInputs";
import { BuildTriangleInputs } from "./BuildTriangleInputs";
import { BuildCustomInputs } from "./BuildCustomInputs";

export function BuildInputs(
  link: VoxelGeometryLinkData,
  data: VoxelModelInputs,
  model: VoxelModelData,
  geometry: VoxelGeometryData
) {
  const args: any[] = [];
  for (const node of geometry.nodes) {
    if (node.type == "box") {
      BuildBoxInputs(args, link, data, node, model, geometry);
    }
    if (node.type == "quad") {
      BuildQuadInputs(args, link, data, node, model, geometry);
    }
    if (node.type == "triangle") {
      BuildTriangleInputs(args, link, data, node, model, geometry);
    }
    if (node.type == "custom") {
      BuildCustomInputs(args, link, data, node, model, geometry);
    }
  }

  return args;
}
