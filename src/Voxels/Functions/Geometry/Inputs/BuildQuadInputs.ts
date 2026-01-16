import { VoxelModelData } from "../../../Models/VoxelModel.types";
import { VoxelModelInputs } from "../GeometryLUT.types";
import {
  BaseVoxelQuadData,
  VoxelGeometryData,
} from "../../../Geometry/VoxelGeometry.types";

import { QuadVoxelGometryInputs } from "../../../../Mesher/Voxels/Models/Nodes/Types/QuadVoxelGometryNodeTypes";
import { cleanArgString, isArgString, processTexture } from "./BaseFunctions";
import { BaseVoxelGeometryTextureProcedureData } from "../../../../Mesher/Voxels/Models/Procedures/TextureProcedure";
import { mapQuadUvs } from "../CalcFunctions";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";
import { Vec4Array } from "@amodx/math";

export function BuildQuadInputs(
  args: any[],
  transform: VoxelGeometryTransform,
  data: VoxelModelInputs,
  quad: BaseVoxelQuadData,
  model: VoxelModelData,
  geometry: VoxelGeometryData
) {
  const ArgIndexes = QuadVoxelGometryInputs.ArgIndexes;
  const inputs = QuadVoxelGometryInputs.CreateArgs();

  let enabled = quad.enabled || true;
  inputs[ArgIndexes.Enabled] = enabled;

  let texture: number | BaseVoxelGeometryTextureProcedureData = 0;
  if (isArgString(quad.texture)) {
    const geometryInputId = cleanArgString(quad.texture);
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
        `Could not find input for ${quad.texture} on geometry ${geometry.id} model ${model.id}`
      );

    if (typeof modelInput == "string") {
      const modelInputId = cleanArgString(modelInput);
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
  if (isArgString(quad.rotation) && typeof quad.rotation == "string") {
    const geoInput = cleanArgString(quad.rotation);
    const modelInput = data.modelInputs[geoInput];
    if (isArgString(modelInput) && typeof modelInput == "string") {
      rotation = data.voxelInputs[cleanArgString(modelInput)];
    } else {
      rotation = modelInput;
    }
  } else {
    rotation = quad.rotation as number;
  }
  inputs[ArgIndexes.Rotation] = rotation ? rotation : 0;

  let doubleSided = false;
  if (isArgString(quad.doubleSided) && typeof quad.doubleSided == "string") {
    const geoInput = cleanArgString(quad.doubleSided);
    const modelInput = data.modelInputs[geoInput];
    if (isArgString(modelInput) && typeof modelInput == "string") {
      doubleSided = data.voxelInputs[cleanArgString(modelInput)];
    } else {
      doubleSided = modelInput;
    }
  } else {
    doubleSided = quad.doubleSided as boolean;
  }
  inputs[ArgIndexes.DoubleSided] = doubleSided ? doubleSided : false;

  let quadUVs: Vec4Array = [0, 0, 1, 1];
  if (isArgString(quad.uv) && typeof quad.uv == "string") {
    const geoInput = cleanArgString(quad.uv);
    const modelInput = data.modelInputs[geoInput];
    if (isArgString(modelInput) && typeof modelInput == "string") {
      quadUVs = data.voxelInputs[cleanArgString(modelInput)];
    } else {
      if (!modelInput) {
        const input = geometry.arguments[geoInput];
        if (input.type == "uv") {
          quadUVs = input.default as any;
        }
      } else {
        quadUVs = modelInput;
      }
    }
  } else if (Array.isArray(quad.uv)) {
    quadUVs = quad.uv;
  }

  inputs[ArgIndexes.UVs] = mapQuadUvs(
    quadUVs,
    inputs[ArgIndexes.Rotation] || 0,
    transform
  );

  args.push(inputs);
}
