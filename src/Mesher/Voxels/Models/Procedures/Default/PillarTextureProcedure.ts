import { Vector4Like } from "@amodx/math";
import type { Quad } from "../../../../Geomtry";
import { VoxelModelBuilder } from "../../../Models/VoxelModelBuilder";
import {
  TextureProcedure,
  BaseVoxelGeomtryTextureProcedureData,
} from "../TextureProcedure";
import { TextureId } from "../../../../../Textures";
import { VoxelFaces } from "../../../../../Math";
import { VoxelLUT } from "../../../../../Voxels/Data/VoxelLUT";

/**
 * Extend your data type so we can add a seed if we want, and define
 * the rotations we can choose from.
 */
export interface PillarTextureProcedureData
  extends BaseVoxelGeomtryTextureProcedureData {
  type: "pillar";
  texture: TextureId | number;
  textureRecrod: {
    sideConnectedTex: TextureId | number;
    sideDisconnectedTex: TextureId | number;
    sideUpTex: TextureId | number;
    sideDownTex: TextureId | number;
    upTex: TextureId | number;
    downTex: TextureId | number;
  };
  direction: "up-down" | "north-south" | "east-west";
}

export class PillarTextureProcedure extends TextureProcedure<PillarTextureProcedureData> {
  getTexture(
    builder: VoxelModelBuilder,
    data: PillarTextureProcedureData,
    closestFace: VoxelFaces,
    primitive: Quad
  ): number {
    if (data.direction == "up-down") {
      if (closestFace == VoxelFaces.Up)
        return data.textureRecrod.upTex as number;
      if (closestFace == VoxelFaces.Down)
        return data.textureRecrod.downTex as number;

      let sideTexture = data.textureRecrod.sideDisconnectedTex as number;
      const currentState = VoxelLUT.voxelIdToModelState[builder.voxel.getId()];

      const topVoxel = builder.nVoxel.getVoxel(
        builder.position.x,
        builder.position.y + 1,
        builder.position.z
      );
      const topSame = topVoxel
        ? builder.voxel.isSameVoxel(topVoxel) &&
          VoxelLUT.voxelIdToModelState[topVoxel.getId()] == currentState
        : false;

      const bottomVoxel = builder.nVoxel.getVoxel(
        builder.position.x,
        builder.position.y - 1,
        builder.position.z
      );
      const bottomSame = bottomVoxel
        ? builder.voxel.isSameVoxel(bottomVoxel) &&
          VoxelLUT.voxelIdToModelState[bottomVoxel.getId()] == currentState
        : false;

      if (topSame && !bottomSame) {
        sideTexture = data.textureRecrod.sideDownTex as number;
      }

      if (!topSame && bottomSame) {
        sideTexture = data.textureRecrod.sideUpTex as number;
      }

      if (topSame && bottomSame) {
        sideTexture = data.textureRecrod.sideConnectedTex as number;
      }

      if (
        closestFace == VoxelFaces.North ||
        closestFace == VoxelFaces.South ||
        closestFace == VoxelFaces.East ||
        closestFace == VoxelFaces.West
      )
        return sideTexture;
    }

    if (data.direction == "north-south") {
      if (closestFace == VoxelFaces.North)
        return data.textureRecrod.upTex as number;
      if (closestFace == VoxelFaces.South)
        return data.textureRecrod.downTex as number;

      let sideTexture = data.textureRecrod.sideDisconnectedTex as number;
      const currentState = VoxelLUT.voxelIdToModelState[builder.voxel.getId()];

      const northVoxel = builder.nVoxel.getVoxel(
        builder.position.x,
        builder.position.y,
        builder.position.z + 1
      );
      const northSame = northVoxel
        ? builder.voxel.isSameVoxel(northVoxel) &&
          VoxelLUT.voxelIdToModelState[northVoxel.getId()] == currentState
        : false;

      const southVoxel = builder.nVoxel.getVoxel(
        builder.position.x,
        builder.position.y,
        builder.position.z - 1
      );
      const southSame = southVoxel
        ? builder.voxel.isSameVoxel(southVoxel) &&
          VoxelLUT.voxelIdToModelState[southVoxel.getId()] == currentState
        : false;

      if (northSame && !southSame) {
        sideTexture = data.textureRecrod.sideDownTex as number;
      }

      if (!northSame && southSame) {
        sideTexture = data.textureRecrod.sideUpTex as number;
      }

      if (northSame && southSame) {
        sideTexture = data.textureRecrod.sideConnectedTex as number;
      }

      if (
        closestFace == VoxelFaces.Up ||
        closestFace == VoxelFaces.Down ||
        closestFace == VoxelFaces.East ||
        closestFace == VoxelFaces.West
      )
        return sideTexture;
    }

    if (data.direction == "east-west") {
      if (closestFace == VoxelFaces.East)
        return data.textureRecrod.upTex as number;
      if (closestFace == VoxelFaces.West)
        return data.textureRecrod.downTex as number;

      let sideTexture = data.textureRecrod.sideDisconnectedTex as number;
      const currentState = VoxelLUT.voxelIdToModelState[builder.voxel.getId()];

      const eastVoxel = builder.nVoxel.getVoxel(
        builder.position.x + 1,
        builder.position.y,
        builder.position.z
      );
      const northSame = eastVoxel
        ? builder.voxel.isSameVoxel(eastVoxel) &&
          VoxelLUT.voxelIdToModelState[eastVoxel.getId()] == currentState
        : false;

      const westVoxel = builder.nVoxel.getVoxel(
        builder.position.x - 1,
        builder.position.y,
        builder.position.z
      );
      const westSame = westVoxel
        ? builder.voxel.isSameVoxel(westVoxel) &&
          VoxelLUT.voxelIdToModelState[westVoxel.getId()] == currentState
        : false;

      if (northSame && !westSame) {
        sideTexture = data.textureRecrod.sideDownTex as number;
      }

      if (!northSame && westSame) {
        sideTexture = data.textureRecrod.sideUpTex as number;
      }

      if (northSame && westSame) {
        sideTexture = data.textureRecrod.sideConnectedTex as number;
      }

      if (
        closestFace == VoxelFaces.Up ||
        closestFace == VoxelFaces.Down ||
        closestFace == VoxelFaces.North ||
        closestFace == VoxelFaces.South
      )
        return sideTexture;
    }

    throw new Error(
      `Invalid direction for pillar box texture procedure | ${data.direction}`
    );
  }

  getOverlayTexture(
    builder: VoxelModelBuilder,
    data: PillarTextureProcedureData,
    closestFace: VoxelFaces,
    primitive: Quad,
    ref: Vector4Like
  ): Vector4Like {
    return ref;
  }

  transformUVs(
    builder: VoxelModelBuilder,
    data: PillarTextureProcedureData,
    closestFace: VoxelFaces,
    primitive: Quad
  ): void {
    if (
      (data.direction == "north-south" &&
        (closestFace == VoxelFaces.East || closestFace == VoxelFaces.West)) ||
      (data.direction == "east-west" &&
        (closestFace == VoxelFaces.North ||
          closestFace == VoxelFaces.South ||
          closestFace == VoxelFaces.Up ||
          closestFace == VoxelFaces.Down))
    ) {
      for (const v of primitive.uvs.vertices) {
        const oldX = v.x;
        const oldY = v.y;
        v.x = 1 - oldY;
        v.y = oldX;
      }
    }
  }
}
