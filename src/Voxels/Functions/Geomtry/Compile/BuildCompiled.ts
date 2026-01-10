import { VoxelGeometryLinkData } from "../../..//Models/VoxelModel.types";
import { VoxelGeometryTransform } from "../../../../Mesher/Geomtry/Geometry.types";
import { VoxelGeometryData } from "../../../Geomtry/VoxelGeomtry.types";
import { CompiledGeomtryNodes } from "../../../../Mesher/Voxels/Models/Nodes/Types/GeomtryNode.types";
import { BuildCompiledBox } from "./BuildCompiledBox";
import { BuildCompiledQuad } from "./BuildCompiledQuad";
import { BuildCompiledTri } from "./BuildCompiledTri";

export function BuildCompiled(
  geoLink: VoxelGeometryLinkData,
  geomtry: VoxelGeometryData
) {
  const buildRules = geomtry.doNotBuildRules !== true;

  const compiled: CompiledGeomtryNodes[] = [];
  for (const node of geomtry.nodes) {
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
