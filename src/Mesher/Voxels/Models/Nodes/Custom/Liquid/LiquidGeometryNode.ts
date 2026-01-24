import { GeoemtryNode } from "../../GeometryNode";
import { VoxelCustomGeometryNode } from "../../../../../../Voxels/Geometry/VoxelGeometry.types";
import { CompassAngles } from "@amodx/math";
import { Quad } from "../../../../../Geometry/Primitives/Quad";
import {
  QuadUVData,
  QuadVerticies,
} from "../../../../../Geometry/Geometry.types";
import { QuadScalarVertexData } from "../../../../../Geometry/Primitives/QuadVertexData";
import { VoxelFaceDirections, VoxelFaces } from "../../../../../../Math";
import type { LiquidVoxelModelArgs } from "../../../../../../Voxels/Models/Defaults/LiquidVoxelModel";
import { getFlowAngle, getFlowGradient, FlowVerticies } from "./FlowGradient";
import { VoxelLightData } from "../../../../../../Voxels/Cursor/VoxelLightData";
import { addVoxelQuad } from "../../../../Geometry/VoxelGeometryBuilder";
import { GetTexture } from "../../../Common/GetTexture";
import { Box } from "../../../../../Geometry/Shapes/Box";
const vertexValue = new QuadScalarVertexData();
const vertexLevel = new QuadScalarVertexData();

const lightData = new VoxelLightData();
const waterHeight = 6 / 7;

const quadRotations: Record<CompassAngles, QuadUVData> = {
  [CompassAngles.North]: Quad.RotateUvs(Quad.FullUVs, CompassAngles.North),
  [CompassAngles.South]: Quad.RotateUvs(Quad.FullUVs, CompassAngles.South),
  [CompassAngles.East]: Quad.RotateUvs(Quad.FullUVs, CompassAngles.East),
  [CompassAngles.West]: Quad.RotateUvs(Quad.FullUVs, CompassAngles.West),

  [CompassAngles.NorthWest]: Quad.RotateUvs(
    Quad.FullUVs,
    CompassAngles.NorthWest,
  ),
  [CompassAngles.NorthEast]: Quad.RotateUvs(
    Quad.FullUVs,
    CompassAngles.NorthEast,
  ),
  [CompassAngles.SouthWest]: Quad.RotateUvs(
    Quad.FullUVs,
    CompassAngles.SouthWest,
  ),
  [CompassAngles.SouthEast]: Quad.RotateUvs(
    Quad.FullUVs,
    CompassAngles.SouthEast,
  ),
};

const uvs: QuadUVData = [
  [1, 1],
  [0, 1],
  [0, 0],
  [1, 0],
];

const { quads: Quads } = Box.Create([
  [0, 0, 0],
  [1, waterHeight, 1],
]);

Quads[VoxelFaces.Up].setUVs(uvs);
Quads[VoxelFaces.Down].setUVs(uvs);

export class LiquidGeometryNode extends GeoemtryNode<
  VoxelCustomGeometryNode,
  LiquidVoxelModelArgs
> {
  init(): void {}

  isExposed(face: VoxelFaces, voxelId: number) {
    const hashed = this.builder.space.getHash(
      this.builder.nVoxel,
      VoxelFaceDirections[face][0] + this.builder.position.x,
      VoxelFaceDirections[face][1] + this.builder.position.y,
      VoxelFaceDirections[face][2] + this.builder.position.z,
    );

    const found = this.builder.space.foundHash[hashed];
    if (!found) return true;
    if (voxelId == this.builder.space.trueVoxelCache[hashed]) return false;
    if (found == 1 || found == 3) return true;
    if (face == VoxelFaces.Up) return true;
    return false;
  }

  determineShading(face: VoxelFaces) {
    this.builder.calculateFaceData(face);
    const lightData = this.builder.lightData[face];
    const worldLight = this.builder.vars.light;
    worldLight.vertices[0] = lightData[0];
    worldLight.vertices[1] = lightData[1];
    worldLight.vertices[2] = lightData[2];
    worldLight.vertices[3] = lightData[3];
  }

  add(args: LiquidVoxelModelArgs) {
    vertexLevel.setAll(15);
    vertexValue.setAll(0);
    const builder = this.builder;

    let flowTexture = args.flowTexture;
    let stillTexture = args.stillTexture;
    let reverseHeight = false;
    let currentHeight = 0;
    if (builder.voxel.getLevelState() == 1 && builder.voxel.getLevel() < 7) {
      reverseHeight = true;
      currentHeight = 1 - builder.voxel.getLevel() / 7;
    }
    /*     if (builder.voxel.getLevelState() == 1 || builder.voxel.getLevel() == 0) {
      flowTexture = 0;
      stillTexture = 0;
    } */

    const voxelId = builder.voxel.getVoxelId();
    let added = false;
    let upFaceExposed = false;
    if (this.isExposed(VoxelFaces.Up, voxelId)) {
      upFaceExposed = true;
      added = true;
      getFlowGradient(builder, vertexLevel);
      const quad = Quads[VoxelFaces.Up];

      this.determineShading(VoxelFaces.Up);

      vertexValue.set(
        vertexLevel.vertices[0] / 7,
        vertexLevel.vertices[1] / 7,
        vertexLevel.vertices[2] / 7,
        vertexLevel.vertices[3] / 7,
      );
      const flowData = getFlowAngle(vertexLevel);
      const uvSet = quadRotations[flowData[0]];
      builder.vars.animation.setAll(flowData[1]);

      quad.uvs.vertices[QuadVerticies.TopRight].x = uvSet[0][0];
      quad.uvs.vertices[QuadVerticies.TopRight].y = uvSet[0][1];

      quad.uvs.vertices[QuadVerticies.TopLeft].x = uvSet[1][0];
      quad.uvs.vertices[QuadVerticies.TopLeft].y = uvSet[1][1];

      quad.uvs.vertices[QuadVerticies.BottomLeft].x = uvSet[2][0];
      quad.uvs.vertices[QuadVerticies.BottomLeft].y = uvSet[2][1];

      quad.uvs.vertices[QuadVerticies.BottomRight].x = uvSet[3][0];
      quad.uvs.vertices[QuadVerticies.BottomRight].y = uvSet[3][1];

      quad.positions.vertices[0].y = vertexValue.vertices[0] * waterHeight;
      quad.positions.vertices[1].y = vertexValue.vertices[1] * waterHeight;
      quad.positions.vertices[2].y = vertexValue.vertices[2] * waterHeight;
      quad.positions.vertices[3].y = vertexValue.vertices[3] * waterHeight;

      if (
        vertexLevel.vertices[0] != 7 ||
        vertexLevel.vertices[1] != 7 ||
        vertexLevel.vertices[2] != 7 ||
        vertexLevel.vertices[3] != 7
      ) {
        GetTexture(builder, flowTexture, VoxelFaces.Up, quad);
      } else {
        GetTexture(builder, stillTexture, VoxelFaces.Up, quad);
      }

      addVoxelQuad(builder, quad);
      builder.updateBounds(quad.bounds);
    }

    if (this.isExposed(VoxelFaces.Down, voxelId)) {
      added = true;

      const quad = Quads[VoxelFaces.Down];
      if (reverseHeight) {
        quad.positions.vertices[QuadVerticies.TopRight].y = currentHeight;
        quad.positions.vertices[QuadVerticies.TopLeft].y = currentHeight;
        quad.positions.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = currentHeight;
      } else {
        quad.positions.vertices[QuadVerticies.TopRight].y = 0;
        quad.positions.vertices[QuadVerticies.TopLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
      }
      quad.setUVs(uvs);
      this.determineShading(VoxelFaces.Down);
      GetTexture(builder, stillTexture, VoxelFaces.Up, quad);

      addVoxelQuad(builder, quad);
      builder.updateBounds(quad.bounds);
    }

    if (this.isExposed(VoxelFaces.North, voxelId)) {
      added = true;

      const quad = Quads[VoxelFaces.North];
      builder.vars.animation.setAll(1);
      this.determineShading(VoxelFaces.North);

      if (upFaceExposed) {
        quad.positions.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.NorthWest] * waterHeight;
        quad.positions.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.NorthEast] * waterHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.uvs.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.NorthWest];
        quad.uvs.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.NorthEast];
      } else if (reverseHeight) {
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = currentHeight;

        quad.uvs.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.uvs.vertices[QuadVerticies.BottomLeft].y = currentHeight;
      } else {
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.setUVs(uvs);
      }

      GetTexture(builder, flowTexture, VoxelFaces.North, quad);
      addVoxelQuad(builder, quad);
      builder.updateBounds(quad.bounds);
    }

    if (this.isExposed(VoxelFaces.South, voxelId)) {
      added = true;

      const quad = Quads[VoxelFaces.South];
      builder.vars.animation.setAll(1);
      this.determineShading(VoxelFaces.South);

      if (upFaceExposed) {
        quad.positions.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.SouthEsat] * waterHeight;
        quad.positions.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.SouthWest] * waterHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.uvs.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.SouthEsat];
        quad.uvs.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.SouthWest];
      } else if (reverseHeight) {
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = currentHeight;

        quad.uvs.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.uvs.vertices[QuadVerticies.BottomLeft].y = currentHeight;
      } else {
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.setUVs(uvs);
      }

      GetTexture(builder, flowTexture, VoxelFaces.Up, quad);
      addVoxelQuad(builder, quad);
      builder.updateBounds(quad.bounds);
    }

    if (this.isExposed(VoxelFaces.East, voxelId)) {
      added = true;

      const quad = Quads[VoxelFaces.East];

      builder.vars.animation.setAll(1);
      this.determineShading(VoxelFaces.East);

      if (upFaceExposed) {
        quad.positions.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.NorthEast] * waterHeight;
        quad.positions.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.SouthEsat] * waterHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.uvs.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.SouthEsat];
        quad.uvs.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.NorthEast];
      } else if (reverseHeight) {
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = currentHeight;

        quad.uvs.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.uvs.vertices[QuadVerticies.BottomLeft].y = currentHeight;
      } else {
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.setUVs(uvs);
      }

      GetTexture(builder, flowTexture, VoxelFaces.Up, quad);
      addVoxelQuad(builder, quad);
      builder.updateBounds(quad.bounds);
    }

    if (this.isExposed(VoxelFaces.West, voxelId)) {
      added = true;

      const quad = Quads[VoxelFaces.West];
      builder.vars.animation.setAll(1);
      this.determineShading(VoxelFaces.West);

      if (upFaceExposed) {
        quad.positions.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.SouthWest] * waterHeight;
        quad.positions.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.NorthWest] * waterHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.uvs.vertices[QuadVerticies.TopRight].y =
          vertexValue.vertices[FlowVerticies.SouthWest];
        quad.uvs.vertices[QuadVerticies.TopLeft].y =
          vertexValue.vertices[FlowVerticies.NorthWest];
      } else if (reverseHeight) {
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = currentHeight;
        quad.uvs.vertices[QuadVerticies.BottomRight].y = currentHeight;
        quad.uvs.vertices[QuadVerticies.BottomLeft].y = currentHeight;
      } else {
        quad.positions.vertices[QuadVerticies.TopLeft].y = 1;
        quad.positions.vertices[QuadVerticies.TopRight].y = 1;
        quad.positions.vertices[QuadVerticies.BottomLeft].y = 0;
        quad.positions.vertices[QuadVerticies.BottomRight].y = 0;
        quad.setUVs(uvs);
      }

      GetTexture(builder, flowTexture, VoxelFaces.Up, quad);
      addVoxelQuad(builder, quad);
      builder.updateBounds(quad.bounds);
    }

    builder.vars.light.setAll(0);

    return added;
  }
}
