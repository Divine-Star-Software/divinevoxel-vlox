import { VoxelGeometryLinkData } from "../../../Models/VoxelModel.types";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";
import { VoxelGeometryData } from "../../../Geometry/VoxelGeometry.types";
import { CompiledGeometryNodes } from "../../../../Mesher/Voxels/Models/Nodes/Types/GeometryNode.types";
import { BuildCompiledBox } from "./BuildCompiledBox";
import { BuildCompiledQuad } from "./BuildCompiledQuad";
import { BuildCompiledTri } from "./BuildCompiledTri";

export function BuildCompiled(
  geoLink: VoxelGeometryLinkData,
  geometry: VoxelGeometryData
) {
  const buildRules = geometry.doNotBuildRules !== true;

  const compiled: CompiledGeometryNodes[] = [];
  for (const node of geometry.nodes) {
    if (node.type == "box") {
      compiled.push(...BuildCompiledBox(buildRules, node, geoLink));
    }
    if (node.type == "quad") {
      compiled.push(BuildCompiledQuad(buildRules, node.points, geoLink));
    }
    if (node.type == "triangle") {
      compiled.push(BuildCompiledTri(buildRules, node.points, geoLink));
    }
    if (node.type == "custom") {
      compiled.push({
        type: "custom",
        id: node.id,
      });
    }
  }

  return compiled;
}
