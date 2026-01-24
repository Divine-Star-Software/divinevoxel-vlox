import { Vector4Like } from "@amodx/math";
import type { Quad } from "../../../../Geometry";
import { VoxelModelBuilder } from "../../../Models/VoxelModelBuilder";
import {
  TextureProcedure,
  BaseVoxelGeometryTextureProcedureData,
} from "../TextureProcedure";

import { TextureId } from "Textures";

import { Vec3Array } from "@amodx/math";
import { VoxelFaceDirections, VoxelFaces } from "../../../../../Math/index.js";
export interface OutlinedTextureProcedureData extends BaseVoxelGeometryTextureProcedureData {
  type: "outlined";
  texture: TextureId | number;
  textureRecrod: {
    top: TextureId | number;
    "corner-top-right": TextureId | number;
    "corner-top-left": TextureId | number;
    "corner-top-left-top-right": TextureId | number;
    bottom: TextureId | number;
    "corner-bottom-right": TextureId | number;
    "corner-bottom-left": TextureId | number;
    "corner-bottom-left-bottom-right": TextureId | number;
    right: TextureId | number;
    left: TextureId | number;
  };
}

const textureMap: string[] = [
  "top",
  "corner-top-right",
  "corner-top-left",
  "corner-top-left-top-right",
  "bottom",
  "corner-bottom-right",
  "corner-bottom-left",
  "corner-bottom-left-bottom-right",
  "right",
  "left",
];

/*
0 -> normal direction
1 -> top right
2 -> top left 
*/
const uvsSets: Record<string, Record<number, number>> = {
  //top bottom faces
  north: {
    0b0: 0,
    0b101: 1,
    0b011: 2,
    0b001: 3,
  },
  south: {
    0b0: 4,
    0b101: 5,
    0b011: 6,
    0b001: 7,
  },
  east: {
    0b0: 8,
  },
  west: {
    0b0: 9,
  },
  //side faces
  top: {
    0b0: 0,
    0b101: 1,
    0b011: 2,
    0b001: 3,
  },
  bottom: {
    0b0: 4,
    0b101: 5,
    0b011: 6,
    0b001: 7,
  },
  right: {
    0b0: 8,
  },
  left: {
    0b0: 9,
  },
};

const CheckSets: Record<VoxelFaces, Record<string, Vec3Array[]>> = {
  [VoxelFaces.Up]: {
    north: [
      [0, 0, 1],
      [1, 0, 1],
      [-1, 0, 1],
    ],
    south: [
      [0, 0, -1],
      [1, 0, -1],
      [-1, 0, -1],
    ],
    east: [[1, 0, 0]],
    west: [[-1, 0, 0]],
  },
  [VoxelFaces.Down]: {
    north: [
      [0, 0, 1],
      [1, 0, 1],
      [-1, 0, 1],
    ],
    south: [
      [0, 0, -1],
      [1, 0, -1],
      [-1, 0, -1],
    ],
    east: [[-1, 0, 0]],
    west: [[1, 0, 0]],
  },
  [VoxelFaces.North]: {
    north: [
      [0, 1, 0],
      [1, 1, 0],
      [-1, 1, 0],
    ],
    south: [
      [0, -1, 0],
      [1, -1, 0],
      [-1, -1, 0],
    ],
    east: [[-1, 0, 0]],
    west: [[1, 0, 0]],
  },
  [VoxelFaces.South]: {
    north: [
      [0, 1, 0],
      [1, 1, 0],
      [-1, 1, 0],
    ],
    south: [
      [0, -1, 0],
      [1, -1, 0],
      [-1, -1, 0],
    ],
    east: [[1, 0, 0]],
    west: [[-1, 0, 0]],
  },
  [VoxelFaces.East]: {
    north: [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, -1],
    ],
    south: [
      [0, -1, 0],
      [0, -1, 1],
      [0, -1, -1],
    ],
    east: [[0, 0, 1]],
    west: [[0, 0, -1]],
  },
  [VoxelFaces.West]: {
    north: [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, -1],
    ],
    south: [
      [0, -1, 0],
      [0, -1, 1],
      [0, -1, -1],
    ],
    east: [[0, 0, -1]],
    west: [[0, 0, 1]],
  },
};

const generateCheck = (
  direction: keyof typeof uvsSets,
  tool: VoxelModelBuilder,
  normal: Vec3Array,
  sets: Vec3Array[],
) => {
  const { x, y, z } = tool.position;

  let key = 0b0;

  const currentVoxelId = tool.voxel.getVoxelId();
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    const cx = x + set[0];
    const cy = y + set[1];
    const cz = z + set[2];

    const hashed = tool.space.getHash(tool.nVoxel, cx, cy, cz);
    const sameLevelCheck = currentVoxelId == tool.space.trueVoxelCache[hashed];
    let normalCheck = true;

    const hashedNormal = tool.space.getHash(
      tool.nVoxel,
      cx + normal[0],
      cy + normal[1],
      cz + normal[2],
    );
    if (tool.space.foundHash[hashedNormal] == 2) {
      normalCheck = false;
    }

    if (sameLevelCheck && normalCheck) {
      key |= 0b1 << i;
    } else {
      key |= 0b0 << i;
      if (i == 0) break;
    }
  }
  if (uvsSets[direction][key] == undefined) return 0;
  const index = uvsSets[direction][key];
  return textureMap[index];
};

export class OutlinedTextureProcedure extends TextureProcedure<OutlinedTextureProcedureData> {
  getTexture(
    builder: VoxelModelBuilder,
    data: OutlinedTextureProcedureData,
    closestFace: VoxelFaces,
    primitive: Quad,
  ): number {
    return data.texture! as number;
  }

  getOverlayTexture(
    builder: VoxelModelBuilder,
    data: OutlinedTextureProcedureData,
    closestFace: VoxelFaces,
    primitive: Quad,
    ref: Vector4Like,
  ): Vector4Like {
    const set = CheckSets[closestFace];
    const normal = VoxelFaceDirections[closestFace];

    const isTopOrBottom =
      closestFace === VoxelFaces.Up || closestFace === VoxelFaces.Down;

    // For top/bottom faces, use north/south/east/west sets.
    // For side faces (north/south/east/west), use top/bottom/right/left sets.
    const dirNorth: keyof typeof uvsSets = isTopOrBottom ? "north" : "top";
    const dirSouth: keyof typeof uvsSets = isTopOrBottom ? "south" : "bottom";
    const dirEast: keyof typeof uvsSets = isTopOrBottom ? "east" : "right";
    const dirWest: keyof typeof uvsSets = isTopOrBottom ? "west" : "left";

    const x = generateCheck(dirNorth, builder, normal, set.north);
    if (x) ref.x = (data as any).textureRecrod[x];

    const y = generateCheck(dirSouth, builder, normal, set.south);
    if (y) ref.y = (data as any).textureRecrod[y];

    const z = generateCheck(dirEast, builder, normal, set.east);
    if (z) ref.z = (data as any).textureRecrod[z];

    const w = generateCheck(dirWest, builder, normal, set.west);
    if (w) ref.w = (data as any).textureRecrod[w];

    return ref;
  }

  transformUVs(
    builder: VoxelModelBuilder,
    data: OutlinedTextureProcedureData,
    closestFace: VoxelFaces,
    primitive: Quad,
  ) {}
}
