import { BaseVoxelGeometryTextureProcedureData } from "../../../../Mesher/Voxels/Models/Procedures/TextureProcedure";
import { TextureManager } from "../../../../Textures/TextureManager";

export function isArgString(data: any) {
  if (typeof data !== "string") return false;
  return data[0] == "@";
}
export function cleanArgString(data: string) {
  return data.replace("@", "");
}

export function processTexture(
  data: string | BaseVoxelGeometryTextureProcedureData
) {
  if (typeof data == "string")
    return TextureManager.getTexture("dve_voxel")!.getTextureIndex(data);
  if(!data) throw new Error(`Bad data passed into processTexture`);
  if (typeof data.texture == "string") {
    data.texture = TextureManager.getTexture("dve_voxel")!.getTextureIndex(
      data.texture
    );
  }
  if (data.textureRecord) {
    for (const key in data.textureRecord) {
      const value = data.textureRecord[key];
      if (typeof value == "string") {
        data.textureRecord[key] =
          TextureManager.getTexture("dve_voxel")!.getTextureIndex(value);
      }
    }
  }

  return data;
}
