import { VoxelModelData } from "../../../Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeometryLUT.types";
import {
  BaseVoxelTriangleData,
  VoxelGeometryData,
} from "../../../Geometry/VoxelGeometry.types";

import { TriangleVoxelGometryInputs } from "../../../../Mesher/Voxels/Models/Nodes/Types/TriangleVoxelGometryNodeTypes";
import { cleanArgString, isArgString, processTexture } from "./BaseFunctions";
import { BaseVoxelGeometryTextureProcedureData } from "../../../../Mesher/Voxels/Models/Procedures/TextureProcedure";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";

export function BuildTriangleInputs(
  args: any[],
  transform: VoxelGeometryTransform,
  data: VoxelModelInputs,
  tri: BaseVoxelTriangleData,
  model: VoxelModelData,
  geometry: VoxelGeometryData
) {
  const ArgIndexes = TriangleVoxelGometryInputs.ArgIndexes;
  const inputs = TriangleVoxelGometryInputs.CreateArgs();

  inputs[ArgIndexes.Enabled] = true;

  let texture: number | BaseVoxelGeometryTextureProcedureData = 0;
  if (isArgString(tri.texture)) {
    const geometryInputId = cleanArgString(tri.texture);
    let modelInput = data.modelInputs[geometryInputId];
    if (!modelInput) {
      for (const argKey in data.modelInputs) {
        const arg = geometry.arguments[argKey];
        if (!arg) continue;
        if (arg.type == "arg-list" && arg.arguments.includes(geometryInputId)) {
          modelInput = data.modelInputs[argKey];
        }
      }
    }
    if (!modelInput)
      throw new Error(
        `Could not find input for ${tri.texture} on geometry ${geometry.id} model ${model.id}`
      );

    if (typeof modelInput == "string") {
      const modelInputId = cleanArgString(tri.texture);
      texture = processTexture(data.voxelInputs[modelInputId]);
    }
    if (typeof modelInput == "object") {
      const procedureData: BaseVoxelGeometryTextureProcedureData = structuredClone(modelInput);
      if (
        typeof procedureData.texture == "string" &&
        isArgString(procedureData.texture)
      ) {
        procedureData.texture =
          data.voxelInputs[cleanArgString(procedureData.texture)];
      }
      if (procedureData.textureRecrod) {
        for (const key in procedureData.textureRecrod) {
          const value = procedureData.textureRecrod[key];
          if (typeof value == "string" && isArgString(value)) {
            procedureData.textureRecrod[key] =
              data.voxelInputs[cleanArgString(value)];
          }
        }
      }
      texture = processTexture(procedureData);
    }
  }
  inputs[ArgIndexes.Texture] = texture;

  let rotation = 0;
  if (isArgString(tri.rotation) && typeof tri.rotation == "string") {
    const geoInput = cleanArgString(tri.rotation);
    const modelInput = data.modelInputs[geoInput];
    if (isArgString(modelInput) && typeof modelInput == "string") {
      rotation = data.voxelInputs[cleanArgString(modelInput)];
    } else {
      rotation = modelInput;
    }
  } else {
    rotation = tri.rotation as number;
  }
  inputs[ArgIndexes.Rotation] = rotation;

  let doubleSided = false;
  if (isArgString(tri.doubleSided) && typeof tri.doubleSided == "string") {
    const geoInput = cleanArgString(tri.doubleSided);
    const modelInput = data.modelInputs[geoInput];
    if (isArgString(modelInput) && typeof modelInput == "string") {
      doubleSided = data.voxelInputs[cleanArgString(modelInput)];
    } else {
      doubleSided = modelInput;
    }
  } else {
    doubleSided = tri.doubleSided as boolean;
  }
  inputs[ArgIndexes.DoubleSided] = doubleSided;

  let uvs = inputs[ArgIndexes.UVs];
  if (isArgString(tri.uv) && typeof tri.uv == "string") {
    const geoInput = cleanArgString(tri.uv);
    const modelInput = data.modelInputs[geoInput];
    if (isArgString(modelInput) && typeof modelInput == "string") {
      uvs = data.voxelInputs[cleanArgString(modelInput)];
    } else {
      if (!modelInput) {
        const input = geometry.arguments[geoInput];
        if (input.type == "uv") {
          uvs = input.default as any;
        }
      } else {
        uvs = modelInput;
      }
    }
  }
  inputs[ArgIndexes.UVs] = uvs;
  /**@TODO updae the tri uvs if it is rotated or transformed */
  if (inputs[ArgIndexes.Rotation]) {
  }
  args.push(inputs);
}
