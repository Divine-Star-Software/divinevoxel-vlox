import { VoxelModelData } from "../../..//Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeomtryLUT.types";
import {
  VoxelCustomGeomtryNode,
  VoxelGeometryData,
} from "../../../Geomtry/VoxelGeomtry.types";

import { cleanArgString, isArgString, processTexture } from "./BaseFunctions";
import { BaseVoxelGeomtryTextureProcedureData } from "../../../../Mesher/Voxels/Models/Procedures/TextureProcedure";
import { VoxelGeometryTransform } from "../../../../Mesher/Geomtry/Geometry.types";

export function BuildCustomInputs(
  args: any[],
  transform: VoxelGeometryTransform,
  data: VoxelModelInputs,
  custom: VoxelCustomGeomtryNode,
  model: VoxelModelData,
  geomtry: VoxelGeometryData
) {
  const customArgs: Record<string, any> = {};

  for (const inputKey in custom.inputs) {
    const inputValue = custom.inputs[inputKey];
    if (isArgString(inputValue) && typeof inputValue == "string") {
      const geomtryArgumentId = cleanArgString(inputValue);
      if (
        isArgString(data.modelInputs[geomtryArgumentId]) &&
        typeof inputValue == "string"
      ) {
        const modelArgumentId = cleanArgString(inputValue);
        const modelArgument = model.arguments[modelArgumentId];
        const voxelInputValue = data.voxelInputs[modelArgumentId];
        if (modelArgument.type == "texture") {
          if (typeof voxelInputValue == "string") {
            customArgs[geomtryArgumentId] = processTexture(voxelInputValue);
            continue;
          }
          if (typeof voxelInputValue == "object") {
            const textureProcedure: BaseVoxelGeomtryTextureProcedureData =
              voxelInputValue;
            if (typeof textureProcedure.texture == "string") {
              textureProcedure.texture = processTexture(
                textureProcedure.texture
              ) as any;
            }
            if (textureProcedure.textureRecrod) {
              for (const key in textureProcedure.textureRecrod) {
                textureProcedure.textureRecrod[key] = processTexture(
                  textureProcedure.textureRecrod[key] as any
                ) as any;
              }
            }
            customArgs[geomtryArgumentId] = textureProcedure;
          }
        } else {
          customArgs[geomtryArgumentId] = voxelInputValue;
        }
      }
    } else {
      customArgs[inputKey] = inputValue;
    }
  }

  args.push(customArgs);
}
