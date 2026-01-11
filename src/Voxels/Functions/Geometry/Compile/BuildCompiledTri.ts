import { Vec3Array, Vec4Array } from "@amodx/math";
import { Triangle } from "../../../../Mesher/Geometry/Primitives/Triangle";
import { getVertexWeights } from "../CalcFunctions";
import { TransformTriangle } from "../../../../Mesher/Geometry/Transform/TransformTriangle";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";
import { CompiledTriangleVoxelGeometryNode } from "../../../../Mesher/Voxels/Models/Nodes/Types/TriangleVoxelGometryNodeTypes";
import { OcclusionFaceRegister } from "../Rules/OcclusionFaceRegister";
import { closestVoxelFace } from "../../../../Math/UtilFunctions";

export function BuildCompiledTri(
  buildRules: boolean,
  points: [Vec3Array, Vec3Array, Vec3Array],
  transform: VoxelGeometryTransform
): CompiledTriangleVoxelGeometryNode {
  const triangle = transform
    ? TransformTriangle(Triangle.Create(points), transform)
    : Triangle.Create(points);

  const normals = triangle.normals.toArray();
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

  const weights: [Vec4Array, Vec4Array, Vec4Array] = [] as any;
  const positions = triangle.positions.toVec3Array();
  for (let i = 0; i < positions.length; i++) {
    weights[i] = getVertexWeights(closestFace, ...positions[i]);
  }

  return {
    type: "triangle",
    positions,
    weights,
    closestFace,
    trueFaceIndex: buildRules
      ? OcclusionFaceRegister.getTriangleId(triangle)
      : undefined,
  };
}
