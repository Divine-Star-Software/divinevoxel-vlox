import { QuadVertices } from "../../../../Geometry/Geometry.types";
import { VoxelFaces, VoxelFacesArray } from "../../../../../Math";
import { Vec4Array } from "@amodx/math";
import { VoxelRelativeCubeIndex } from "../../../../../Voxels/Geometry/VoxelRelativeCubeIndex";
import { VoxelLightData } from "../../../../../Voxels/Cursor/VoxelLightData";

export const GradientCheckSets: Record<
  VoxelFaces,
  Record<QuadVertices, number[]>
> = [] as any;

GradientCheckSets[VoxelFaces.Up] = [] as any;
GradientCheckSets[VoxelFaces.Up][QuadVertices.TopRight] = [
  //1
  1, 1, 0,
  //2
  0, 1, 1,
  //3
  1, 1, 1,
];
GradientCheckSets[VoxelFaces.Up][QuadVertices.TopLeft] = [
  //1
  -1, 1, 0,
  //2
  0, 1, 1,
  //3
  -1, 1, 1,
];
GradientCheckSets[VoxelFaces.Up][QuadVertices.BottomLeft] = [
  //1
  -1, 1, 0,
  //2
  0, 1, -1,
  //3
  -1, 1, -1,
];
GradientCheckSets[VoxelFaces.Up][QuadVertices.BottomRight] = [
  //1
  1, 1, 0,
  //2
  0, 1, -1,
  //3
  1, 1, -1,
];

GradientCheckSets[VoxelFaces.Down] = [] as any;
GradientCheckSets[VoxelFaces.Down][QuadVertices.TopRight] = [
  //1
  -1, -1, 0,
  //2
  0, -1, 1,
  //3
  -1, -1, 1,
];
GradientCheckSets[VoxelFaces.Down][QuadVertices.TopLeft] = [
  //1
  1, -1, 0,
  //2
  0, -1, 1,
  //3
  1, -1, 1,
];
GradientCheckSets[VoxelFaces.Down][QuadVertices.BottomLeft] = [
  //1
  1, -1, 0,
  //2
  0, -1, -1,
  //3
  1, -1, -1,
];
GradientCheckSets[VoxelFaces.Down][QuadVertices.BottomRight] = [
  //1
  -1, -1, 0,
  //2
  0, -1, -1,
  //3
  -1, -1, -1,
];

GradientCheckSets[VoxelFaces.East] = [] as any;
GradientCheckSets[VoxelFaces.East][QuadVertices.TopRight] = [
  //1
  1, 0, 1,
  //2
  1, 1, 0,
  //3
  1, 1, 1,
];
GradientCheckSets[VoxelFaces.East][QuadVertices.TopLeft] = [
  //1
  1, 0, -1,
  //2
  1, 1, 0,
  //3
  1, 1, -1,
];
GradientCheckSets[VoxelFaces.East][QuadVertices.BottomLeft] = [
  //1
  1, 0, -1,
  //2
  1, -1, 0,
  //3
  1, -1, -1,
];
GradientCheckSets[VoxelFaces.East][QuadVertices.BottomRight] = [
  //1
  1, 0, 1,
  //2
  1, -1, 0,
  //3
  1, -1, 1,
];

GradientCheckSets[VoxelFaces.West] = [] as any;
GradientCheckSets[VoxelFaces.West][QuadVertices.TopRight] = [
  //1
  -1, 0, -1,
  //2
  -1, 1, 0,
  //3
  -1, 1, -1,
];
GradientCheckSets[VoxelFaces.West][QuadVertices.TopLeft] = [
  //1
  -1, 0, 1,
  //2
  -1, 1, 0,
  //3
  -1, 1, 1,
];
GradientCheckSets[VoxelFaces.West][QuadVertices.BottomLeft] = [
  //1
  -1, 0, 1,
  //2
  -1, -1, 0,
  //3
  -1, -1, 1,
];
GradientCheckSets[VoxelFaces.West][QuadVertices.BottomRight] = [
  //1
  -1, 0, -1,
  //2
  -1, -1, 0,
  //3
  -1, -1, -1,
];

GradientCheckSets[VoxelFaces.South] = [] as any;
GradientCheckSets[VoxelFaces.South][QuadVertices.TopRight] = [
  //1
  1, 0, -1,
  //2
  0, 1, -1,
  //3
  1, 1, -1,
];
GradientCheckSets[VoxelFaces.South][QuadVertices.TopLeft] = [
  //1
  -1, 0, -1,
  //2
  0, 1, -1,
  //3
  -1, 1, -1,
];
GradientCheckSets[VoxelFaces.South][QuadVertices.BottomLeft] = [
  //1
  -1, 0, -1,
  //2
  0, -1, -1,
  //3
  -1, -1, -1,
];
GradientCheckSets[VoxelFaces.South][QuadVertices.BottomRight] = [
  //1
  1, 0, -1,
  //2
  0, -1, -1,
  //3
  1, -1, -1,
];

GradientCheckSets[VoxelFaces.North] = [] as any;
GradientCheckSets[VoxelFaces.North][QuadVertices.TopRight] = [
  //1
  -1, 0, 1,
  //2
  0, 1, 1,
  //3
  -1, 1, 1,
];
GradientCheckSets[VoxelFaces.North][QuadVertices.TopLeft] = [
  //1
  1, 0, 1,
  //2
  0, 1, 1,
  //3
  1, 1, 1,
];
GradientCheckSets[VoxelFaces.North][QuadVertices.BottomLeft] = [
  //1
  1, 0, 1,
  //2
  0, -1, 1,
  //3
  1, -1, 1,
];
GradientCheckSets[VoxelFaces.North][QuadVertices.BottomRight] = [
  //1
  -1, 0, 1,
  //2
  0, -1, 1,
  //3
  -1, -1, 1,
];

export const GradientCheckSetsArray = new Int8Array(6 * 4 * 9);
const verts: QuadVertices[] = [
  QuadVertices.TopRight,
  QuadVertices.TopLeft,
  QuadVertices.BottomLeft,
  QuadVertices.BottomRight,
];

const faceLength = 9 * 4;
for (const face of VoxelFacesArray) {
  for (let v = 0; v < verts.length; v++) {
    for (let i = 0; i < 9; i++) {
      GradientCheckSetsArray[face * faceLength + verts[v] * 9 + i] =
        GradientCheckSets[face][verts[v]][i];
    }
  }
}

export const GeometryCheckSetIndexes: Record<
  VoxelFaces,
  Record<QuadVertices, [number, number, number]>
> = [] as any;

for (const face of VoxelFacesArray) {
  GeometryCheckSetIndexes[face] ??= [] as any;
  for (let v = 0; v < verts.length; v++) {
    GeometryCheckSetIndexes[face][verts[v]] ??= [] as any;
    let checkSetIndex = 0;
    for (let i = 0; i < 9; i += 3) {
      const x = GradientCheckSets[face][verts[v]][i];
      const y = GradientCheckSets[face][verts[v]][i + 1];
      const z = GradientCheckSets[face][verts[v]][i + 2];

      GeometryCheckSetIndexes[face][verts[v]][checkSetIndex] =
        VoxelRelativeCubeIndex.getIndex(x, y, z);
      checkSetIndex++;
    }
  }
}

export const CenterDirectionIndex = VoxelRelativeCubeIndex.getIndex(0, 0, 0);
export const DirectionIndexes: Record<VoxelFaces, number> = [] as any;
DirectionIndexes[VoxelFaces.Up] = VoxelRelativeCubeIndex.getIndex(0, 1, 0);
DirectionIndexes[VoxelFaces.Down] = VoxelRelativeCubeIndex.getIndex(0, -1, 0);
DirectionIndexes[VoxelFaces.North] = VoxelRelativeCubeIndex.getIndex(0, 0, 1);
DirectionIndexes[VoxelFaces.South] = VoxelRelativeCubeIndex.getIndex(0, 0, -1);
DirectionIndexes[VoxelFaces.East] = VoxelRelativeCubeIndex.getIndex(1, 0, 0);
DirectionIndexes[VoxelFaces.West] = VoxelRelativeCubeIndex.getIndex(-1, 0, 0);

/**
quad flip
2       1
|    /  |
|   /   |
|  /    |
| /     |
3       4
*/

function isMax3(num: number, v1: number, v2: number, v3: number) {
  return num > v1 && num > v2 && num > v3;
}
function isAllEqual(num: number, v1: number, v2: number, v3: number) {
  return num == v1 && v1 == v2 && v2 == v3;
}

export function shouldCauseFlip(
  topRight: number,
  topLeft: number,
  bottomLeft: number,
  bottomRight: number
) {
  if (isAllEqual(topRight, topLeft, bottomRight, bottomLeft)) return false;

  if (
    isMax3(bottomRight, topLeft, bottomLeft, topRight) ||
    isMax3(topLeft, bottomLeft, bottomRight, topRight)
  )
    return false;

  if (
    isMax3(topRight, topLeft, bottomLeft, bottomRight) ||
    isMax3(bottomLeft, topLeft, bottomRight, topRight)
  )
    return true;

  return (topRight + bottomLeft) / 2 > (topLeft + bottomRight) / 2;
}

const lightData = new VoxelLightData();
export function getInterpolationValue(value: Vec4Array, weights: Vec4Array) {
  return lightData.createLightValue(
    lightData.getS(value[0]) * weights[0] +
      lightData.getS(value[1]) * weights[1] +
      lightData.getS(value[2]) * weights[2] +
      lightData.getS(value[3]) * weights[3],
    lightData.getR(value[0]) * weights[0] +
      lightData.getR(value[1]) * weights[1] +
      lightData.getR(value[2]) * weights[2] +
      lightData.getR(value[3]) * weights[3],
    lightData.getG(value[0]) * weights[0] +
      lightData.getG(value[1]) * weights[1] +
      lightData.getG(value[2]) * weights[2] +
      lightData.getG(value[3]) * weights[3],
    lightData.getB(value[0]) * weights[0] +
      lightData.getB(value[1]) * weights[1] +
      lightData.getB(value[2]) * weights[2] +
      lightData.getB(value[3]) * weights[3]
  );
}

export type QuadVertexWeights = [Vec4Array, Vec4Array, Vec4Array, Vec4Array];
