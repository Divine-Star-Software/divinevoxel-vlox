import { Vec4Array } from "@amodx/math";
import { VoxelFaceDirections, VoxelFaces } from "../../../../../Math";
import { Quad } from "../../../../Geometry/Primitives/Quad";
import { addVoxelQuad } from "../../../Geometry/VoxelGeometryBuilder";
import { GeometryNode } from "../GeometryNode";
import {
  CompiledQuadVoxelGeometryNode,
  QuadVoxelGeometryArgs,
  QuadVoxelGeometryInputs,
} from "../Types/QuadVoxelGeometryNodeTypes";
import { GetTexture } from "../../Common/GetTexture";
import { CullRuledFace } from "../../Common/Faces/CullRuledFace";
import { ShadeRuledFace } from "../../Common/Faces/ShadeRuledFace";
import { ShadeRulelessFace } from "../../Common/Faces/ShadeRulelessFace";

const ArgIndexes = QuadVoxelGeometryInputs.ArgIndexes;

export class QuadVoxelGeometryNode extends GeometryNode<
  CompiledQuadVoxelGeometryNode,
  QuadVoxelGeometryArgs
> {
  quad: Quad;
  vertexWeights: [Vec4Array, Vec4Array, Vec4Array, Vec4Array];
  closestFace: VoxelFaces;

  trueFaceIndex?: number;

  init() {
    this.quad = Quad.Create(this.data.positions);
    this.vertexWeights = this.data.weights;
    this.closestFace = this.data.closestFace;
    if (this.data.trueFaceIndex !== undefined)
      this.trueFaceIndex = this.data.trueFaceIndex;
  }

  add(args: QuadVoxelGeometryArgs) {
    if (!args[ArgIndexes.Enabled]) return false;

    const builder = this.builder;

    if (
      this.trueFaceIndex !== undefined &&
      !CullRuledFace(builder, this.trueFaceIndex)
    )
      return false;

    builder.calculateFaceData(this.closestFace);

    this.trueFaceIndex !== undefined
      ? ShadeRuledFace(
          builder,
          this.trueFaceIndex,
          builder.lightData[this.closestFace],
          this.vertexWeights,
          4,
        )
      : ShadeRulelessFace(
          builder,
          builder.lightData[this.closestFace],
          this.vertexWeights,
          4,
        );
    const quad = this.quad;

    quad.doubleSided = args[ArgIndexes.DoubleSided];
    const uvs = args[ArgIndexes.UVs];
    //1
    quad.uvs.vertices[0].x = uvs[0][0];
    quad.uvs.vertices[0].y = uvs[0][1];
    //2
    quad.uvs.vertices[1].x = uvs[1][0];
    quad.uvs.vertices[1].y = uvs[1][1];
    //3
    quad.uvs.vertices[2].x = uvs[2][0];
    quad.uvs.vertices[2].y = uvs[2][1];
    //4
    quad.uvs.vertices[3].x = uvs[3][0];
    quad.uvs.vertices[3].y = uvs[3][1];

    GetTexture(builder, args[ArgIndexes.Texture], this.closestFace, quad);
    addVoxelQuad(builder, quad);

    builder.updateBounds(quad.bounds);
    builder.vars.light.setAll(0);
    builder.vars.ao.setAll(0);

    return true;
  }
}
