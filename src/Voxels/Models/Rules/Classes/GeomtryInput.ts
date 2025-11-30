import { BaseVoxelGeomtryTextureProcedureData } from "Mesher/Voxels/Models/Procedures/TextureProcedure";
import { TextureId } from "../../../../Textures";
import { TextureManager } from "../../../../Textures/TextureManager";
import {
  VoxelGeometryData,
  VoxelModelConstructorData,
} from "../../VoxelModel.types";

export class GeomtryInput {
  inputObservers = new Map<string, ((data: any) => void)[]>();
  orginalArgs: any[] = [];
  args: any[] = [];
  get arguments() {
    return this.geomtry.arguments;
  }
  proxy: Record<string, any> = {};
  isArgString(data: any) {
    if (typeof data !== "string") return false;
    return data[0] == "@";
  }
  cloneArgs() {
    return structuredClone(this.args);
  }
  resetDefaults() {
    this.args = structuredClone(this.orginalArgs);
  }

  currentModelState: string;
  currentModel: VoxelModelConstructorData;
  constructor(public geomtry: VoxelGeometryData) {
    for (const arg in geomtry.arguments) {
      if (this.inputObservers.has(arg)) continue;
      const obs: ((data: any) => void)[] = [];
      this.inputObservers.set(arg, obs)!;
      const data = geomtry.arguments[arg];
      Object.defineProperty(this.proxy, arg, {
        set: (value) => {
          if (data.type == "texture") {
            const textureId = value as TextureId;
            if (!Array.isArray(textureId) && typeof textureId == "object") {
              const procedureData = structuredClone({
                ...(textureId as any),
              }) as BaseVoxelGeomtryTextureProcedureData;
              if (procedureData.texture) {
                let texture = procedureData.texture as any;
                if (typeof texture == "string" && texture[0] === "@") {
                  const input = texture.replace("@", "");
                  texture =
                    this.currentModel.inputs["*"]?.[input] ??
                    this.currentModel.inputs[this.currentModelState][input];
                }
                procedureData.texture =
                  TextureManager.getTexture("dve_voxel")?.getTextureIndex(
                    texture
                  );
              }
              if (procedureData.textureRecrod) {
                for (const key in procedureData.textureRecrod) {
                  let texture = procedureData.textureRecrod[key] as any;
                  if (typeof texture == "string" && texture[0] === "@") {
                    const input = texture.replace("@", "");
                    texture =
                      this.currentModel.inputs["*"]?.[input] ??
                      this.currentModel.inputs[this.currentModelState][input];
                  }
                  procedureData.textureRecrod[key] =
                    TextureManager.getTexture("dve_voxel")?.getTextureIndex(
                      texture
                    );
                }
              }
              value = { ...procedureData };
            } else {
              value =
                TextureManager.getTexture("dve_voxel")?.getTextureIndex(
                  textureId
                );
            }
          }
          for (const func of obs) {
            func(value);
          }
        },
      });
    }
  }

  onInput(id: string, subscribe: (data: any) => any) {
    id = id.replace("@", "");
    const obs = this.inputObservers.get(id);
    if (!obs)
      throw new Error(`Input [${id}] does not exist on ${this.geomtry.id}`);
    return obs.push(subscribe);
  }
}
