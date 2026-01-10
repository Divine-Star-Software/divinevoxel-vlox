import { Vec3Array } from "@amodx/math";
import { Quad } from "../../../../Mesher/Geomtry/Primitives/Quad";
import { getQuadWeights, mapQuadUvs } from "../CalcFunctions";
import { TransformQuad } from "../../../../Mesher/Geomtry/Transform/TransformQuad";
import { VoxelGeometryTransform } from "../../../../Mesher/Geomtry/Geometry.types";
import { CompiledQuadVoxelGeomtryNode } from "../../../../Mesher/Voxels/Models/Nodes/Types/QuadVoxelGometryNodeTypes";
import { OcclusionFaceRegister } from "../Rules/OcclusionFaceRegister";
import { closestVoxelFace } from "../../../../Math/UtilFunctions";

export function BuildCompiledQuad(
  buildRules: boolean,
  points: [Vec3Array, Vec3Array, Vec3Array, Vec3Array],
  transform: VoxelGeometryTransform = {}
): CompiledQuadVoxelGeomtryNode {
  const quad = transform
    ? TransformQuad(Quad.Create(points), transform)
    : Quad.Create(points);

  const normals = quad.normals.toArray();
  const averageNormal: Vec3Array = [0, 0, 0];

  for (let i = 0; i < normals.length; i++) {
    averageNormal[0] += normals[i].x;
    averageNormal[1] += normals[i].y;
    averageNormal[2] += normals[i].z;
  }
  averageNormal[0] /= normals.length;
  averageNormal[1] /= normals.length;
  averageNormal[2] /= normals.length;

  // Normalize the average normal
  const magnitude = Math.sqrt(
    averageNormal[0] * averageNormal[0] +
      averageNormal[1] * averageNormal[1] +
      averageNormal[2] * averageNormal[2]
  );
  if (magnitude !== 0) {
    averageNormal[0] /= magnitude;
    averageNormal[1] /= magnitude;
    averageNormal[2] /= magnitude;
  }

  const closestFace = closestVoxelFace(averageNormal);

  const weights = getQuadWeights(quad, closestFace);
  const positions = quad.positions.toVec3Array();

  return {
    type: "quad",
    positions,
    weights,
    closestFace,
    trueFaceIndex: buildRules
      ? OcclusionFaceRegister.getQuadId(quad)
      : undefined,
  };
}
