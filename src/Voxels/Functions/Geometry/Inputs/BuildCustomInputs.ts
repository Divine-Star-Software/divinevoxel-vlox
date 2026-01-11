import { VoxelModelData } from "../../..//Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeometryLUT.types";
import {
  VoxelCustomGeometryNode,
  VoxelGeometryData,
} from "../../../Geometry/VoxelGeometry.types";

import { cleanArgString, isArgString, processTexture } from "./BaseFunctions";
import { BaseVoxelGeometryTextureProcedureData } from "../../../../Mesher/Voxels/Models/Procedures/TextureProcedure";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";

export function BuildCustomInputs(
  args: any[],
  transform: VoxelGeometryTransform,
  data: VoxelModelInputs,
  custom: VoxelCustomGeometryNode,
  model: VoxelModelData,
  geometry: VoxelGeometryData
) {
  const customArgs: Record<string, any> = {};

  for (const inputKey in custom.inputs) {
    const inputValue = custom.inputs[inputKey];
    if (isArgString(inputValue) && typeof inputValue == "string") {
      const geometryArgumentId = cleanArgString(inputValue);
      if (
        isArgString(data.modelInputs[geometryArgumentId]) &&
        typeof inputValue == "string"
      ) {
        const modelArgumentId = cleanArgString(inputValue);
        const modelArgument = model.arguments[modelArgumentId];
        const voxelInputValue = data.voxelInputs[modelArgumentId];
        if (modelArgument.type == "texture") {
          if (typeof voxelInputValue == "string") {
            customArgs[geometryArgumentId] = processTexture(voxelInputValue);
            continue;
          }
          if (typeof voxelInputValue == "object") {
            const textureProcedure: BaseVoxelGeometryTextureProcedureData =
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
            customArgs[geometryArgumentId] = textureProcedure;
          }
        } else {
          customArgs[geometryArgumentId] = voxelInputValue;
        }
      }
    } else {
      customArgs[inputKey] = inputValue;
    }
  }

  args.push(customArgs);
}
