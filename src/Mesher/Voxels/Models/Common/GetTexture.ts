import { BaseVoxelGeometryTextureProcedureData } from "../Procedures/TextureProcedure"
import { VoxelModelBuilder } from "../VoxelModelBuilder";
import { TextureProcedureRegister } from "../Procedures/TextureProcedureRegister";
import { Quad } from "../../../Geometry";
import { VoxelFaces } from "../../../../Math";
import { Triangle } from "../../../Geometry";

export function GetTexture(
  builder: VoxelModelBuilder,
  data: number | BaseVoxelGeometryTextureProcedureData,
  closestFace: VoxelFaces,
  primitive: Quad|Triangle
) {
  if (typeof data == "number") {
    builder.vars.textureIndex = data as number;
  } else {
    const procedure = TextureProcedureRegister.get(data.type);
    builder.vars.textureIndex = procedure.getTexture(
      builder,
      data,
      closestFace,
      primitive
    );
    procedure.transformUVs(builder, data, closestFace, primitive);
    procedure.getOverlayTexture(
      builder,
      data,
      closestFace,
      primitive,
      builder.vars.overlayTextures
    );
  }
}
