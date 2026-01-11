import { VoxelModelData } from "../Models/VoxelModel.types";
import { VoxelData } from "../Types/Voxel.types";
import { VoxelLUT } from "../Data/VoxelLUT";
import { BinarySchema } from "../State/Schema/BinarySchema";
import { VoxelBinaryStateSchemaNode } from "../State/State.types";
import { VoxelSchemas } from "../State/VoxelSchemas";
import { EngineStats } from "../../Stats/EngineStats";
import { VoxelGeometryData } from "../Geomtry/VoxelGeomtry.types";
import { BuildGeomtryLUT } from "./Geomtry/BuildGeomtryLUT";
import { VoxelMaterialData } from "../Types/VoxelMaterial.types";
import { VoxelSubstanceData } from "../Types/VoxelSubstances.types";
import { ReltionalStateBuilder } from "../State/Reltional/ReltionalStateBuilder";

function recurse(
  index: number,
  current: string[],
  result: string[],
  valuePairs: [string, string[]][]
) {
  if (index === valuePairs.length) {
    result.push(current.join(","));
    return;
  }

  const [key, values] = valuePairs[index];
  for (const value of values) {
    current.push(`${key}=${value}`);
    recurse(index + 1, current, result, valuePairs);
    current.pop();
  }
}

function getAllCombinations(valuePairs: [string, string[]][]) {
  const result: string[] = [];
  recurse(0, [], result, valuePairs);
  return result;
}

function buildScehmas(voxels: VoxelData[], models: VoxelModelData[]) {
  //build state schemas
  for (const model of models) {
    VoxelLUT.models.register(model.id);
    //build state schema
    const schemaNodes: VoxelBinaryStateSchemaNode[] = [];
    for (const schemaNode of model.stateSchema) {
      const node: VoxelBinaryStateSchemaNode = {
        name: schemaNode.name,
        bitIndex: schemaNode.bitIndex,
        bitSize: schemaNode.bitSize,
      };
      if (schemaNode.values) {
        node.values = schemaNode.values;
      }
      schemaNodes.push(node);
    }
    const stateSchema = new BinarySchema(schemaNodes);
    VoxelSchemas.state.set(model.id, stateSchema);

    //build reltional state schema
    const reltionalSchemaNodes: VoxelBinaryStateSchemaNode[] = [];
    let bitIndex = 0;
    for (const schemaNode of model.relationsSchema) {
      const node: VoxelBinaryStateSchemaNode = {
        name: schemaNode.name,
        bitIndex: bitIndex,
        bitSize: 1,
        values: ["false", "true"],
      };
      bitIndex++;
      reltionalSchemaNodes.push(node);
    }
    const reltionalStateSchema = new BinarySchema(reltionalSchemaNodes);
    VoxelSchemas.reltioanlState.set(model.id, reltionalStateSchema);
    const reltionalStateBuilder = new ReltionalStateBuilder(
      reltionalStateSchema,
      model.relationsSchema
    );
    VoxelSchemas.reltionalStateBuilder.set(model.id, reltionalStateBuilder);
  }

  //build mod schemas
  for (const voxel of voxels) {
    const modelData = voxel.properties["dve_model_data"];
    const trueVoxelId = VoxelLUT.voxelIds.register(voxel.id);

    VoxelLUT.materialMap[trueVoxelId] = VoxelLUT.material.getNumberId(
      voxel.properties["dve_rendered_material"] || "dve_solid"
    );
    VoxelLUT.substanceMap[trueVoxelId] = VoxelLUT.material.getNumberId(
      voxel.properties["dve_substance"] || "dve_solid"
    );
    if (!modelData) continue;
    VoxelLUT.modelsIndex[trueVoxelId] = VoxelLUT.models.getNumberId(
      modelData.id
    );
    //build state schema
    const schemaNodes: VoxelBinaryStateSchemaNode[] = [];
    if (modelData.modSchema) {
      for (const schemaNode of modelData.modSchema) {
        const node: VoxelBinaryStateSchemaNode = {
          name: schemaNode.name,
          bitIndex: schemaNode.bitIndex,
          bitSize: schemaNode.bitSize,
        };
        if (schemaNode.values) {
          node.values = schemaNode.values;
        }
        schemaNodes.push(node);
      }
    }
    const stateSchema = new BinarySchema(schemaNodes);
    VoxelSchemas.mod.set(voxel.id, stateSchema);

    //build reltional mod schema
    const reltionalSchemaNodes: VoxelBinaryStateSchemaNode[] = [];
    if (modelData.modRelationSchema) {
      let bitIndex = 0;
      for (const schemaNode of modelData.modRelationSchema) {
        const node: VoxelBinaryStateSchemaNode = {
          name: schemaNode.name,
          bitIndex: bitIndex,
          bitSize: 1,
          values: ["false", "true"],
        };
        bitIndex++;
        reltionalSchemaNodes.push(node);
      }
    }
    const reltionalStateSchema = new BinarySchema(reltionalSchemaNodes);
    VoxelSchemas.reltioanlMod.set(voxel.id, reltionalStateSchema);
    const reltionalModBuilder = new ReltionalStateBuilder(
      reltionalStateSchema,
      modelData.modRelationSchema || []
    );
    VoxelSchemas.reltionalModBuilder.set(voxel.id, reltionalModBuilder);
  }
}

function buildStatePalette(voxels: VoxelData[], models: VoxelModelData[]) {
  const modelStateArray = new Map<string, number[]>();

  for (const model of models) {
    const schema = VoxelSchemas.state.get(model.id)!;

    const valuePairs: [key: string, values: string[]][] = [];

    for (const node of schema.nodes) {
      valuePairs.push([
        node.name,
        node.valuePalette
          ? node.valuePalette._palette
          : new Array(node.bitMask + 1).fill(0).map((_, i) => `${i}`),
      ]);
    }
    const stateStrings = getAllCombinations(valuePairs);

    const statePalette: number[] = [];
    for (const state of stateStrings) {
      const value = schema.readString(!state ? "*" : state);
      statePalette.push(value);
    }
    modelStateArray.set(model.id, statePalette);
  }

  const finalPalette: [
    voxelId: number,
    stateValue: number,
    modValue: number
  ][] = [[0, 0, 0]];
  const finalPaletteRecord: number[][][] = [[[0]]];

  let voxelIdCount = 1;
  for (const voxel of voxels) {
    const modelData = voxel.properties["dve_model_data"];
    if (!modelData) continue;
    const schema = VoxelSchemas.mod.get(voxel.id);
    const valuePairs: [key: string, values: string[]][] = [];

    if (schema) {
      for (const node of schema.nodes) {
        valuePairs.push([
          node.name,
          node.valuePalette
            ? node.valuePalette._palette
            : new Array(node.bitMask + 1).fill(0).map((_, i) => `${i}`),
        ]);
      }
    }

    const stateStrings = getAllCombinations(valuePairs);
    const modPalette: number[] = [];
    if (valuePairs.length && schema) {
      for (const state of stateStrings) {
        const value = schema.readString(!state ? "*" : state);
        modPalette.push(value);
      }
    } else {
      modPalette.push(0);
    }

    const voxelId = VoxelLUT.voxelIds.getNumberId(voxel.id);
    const statePalette = modelStateArray.get(modelData.id)!;

    VoxelLUT.totalStates[voxelId] = statePalette.length;
    VoxelLUT.totalMods[voxelId] = modPalette.length;

    finalPaletteRecord[voxelId] = new Array(modPalette.length).fill(-1);
    for (let modIndex = 0; modIndex < modPalette.length; modIndex++) {
      finalPaletteRecord[voxelId][modPalette[modIndex]] = new Array(
        statePalette.length
      ).fill(-1);
      for (let stateIndex = 0; stateIndex < statePalette.length; stateIndex++) {
        finalPalette[voxelIdCount] = [
          voxelId,
          statePalette[stateIndex],
          modPalette[modIndex],
        ];
        finalPaletteRecord[voxelId][modPalette[modIndex]][
          statePalette[stateIndex]
        ] = voxelIdCount;
        VoxelLUT.voxelIdToModelState[voxelIdCount] = statePalette[stateIndex];
        voxelIdCount++;
      }
    }
  }

  EngineStats.palette.paletteSize = finalPalette.length;

  VoxelLUT.voxels = finalPalette;
  VoxelLUT.voxelRecord = finalPaletteRecord;
}

function buildReltionalStatePalette(
  voxels: VoxelData[],
  models: VoxelModelData[]
) {
  const modelStateArray = new Map<string, number[]>();

  for (const model of models) {
    const schema = VoxelSchemas.reltioanlState.get(model.id)!;

    const valuePairs: [key: string, values: string[]][] = [];

    for (const node of schema.nodes) {
      valuePairs.push([node.name, ["false", "true"]]);
    }
    const stateStrings = getAllCombinations(valuePairs);

    const statePalette: number[] = [];
    for (const state of stateStrings) {
      const value = schema.readString(!state ? "*" : state);
      statePalette.push(value);
    }
    modelStateArray.set(model.id, statePalette);
  }

  const finalPalette: [
    voxelId: number,
    stateValue: number,
    modValue: number
  ][] = [[0, 0, 0]];
  const finalPaletteRecord: number[][][] = [[[0]]];

  let voxelIdCount = 1;
  for (const voxel of voxels) {
    const modelData = voxel.properties["dve_model_data"];
    if (!modelData) continue;
    const schema = VoxelSchemas.reltioanlMod.get(voxel.id);
    const valuePairs: [key: string, values: string[]][] = [];

    if (schema) {
      for (const node of schema.nodes) {
        valuePairs.push([node.name, ["false", "true"]]);
      }
    }

    const stateStrings = getAllCombinations(valuePairs);
    const modPalette: number[] = [];
    if (valuePairs.length && schema) {
      for (const state of stateStrings) {
        const value = schema.readString(!state ? "*" : state);
        modPalette.push(value);
      }
    } else {
      modPalette.push(0);
    }

    const voxelId = VoxelLUT.voxelIds.getNumberId(voxel.id);
    const statePalette = modelStateArray.get(modelData.id)!;

    VoxelLUT.totalReltionalStates[voxelId] = statePalette.length;
    VoxelLUT.totalReltionalMods[voxelId] = modPalette.length;

    finalPaletteRecord[voxelId] = new Array(modPalette.length).fill(-1);

    for (let modIndex = 0; modIndex < modPalette.length; modIndex++) {
      finalPaletteRecord[voxelId][modPalette[modIndex]] = new Array(
        statePalette.length
      ).fill(-1);
      for (let stateIndex = 0; stateIndex < statePalette.length; stateIndex++) {
        finalPalette[voxelIdCount] = [
          voxelId,
          statePalette[stateIndex],
          modPalette[modIndex],
        ];
        finalPaletteRecord[voxelId][modPalette[modIndex]][
          statePalette[stateIndex]
        ] = voxelIdCount;

        voxelIdCount++;
      }
    }
  }

  EngineStats.palette.reltionalPaletteSize = finalPalette.length;

  VoxelLUT.reltioanlVoxels = finalPalette;
  VoxelLUT.reltionalVoxelRecord = finalPaletteRecord;
}

export function BuildLUTs(
  materials: VoxelMaterialData[],
  substances: VoxelSubstanceData[],
  voxels: VoxelData[],
  geomtry: VoxelGeometryData[],
  models: VoxelModelData[]
) {
  for (const material of materials) {
    VoxelLUT.material.register(material.id);
  }
  for (const substance of substances) {
    VoxelLUT.substance.register(substance.id);
  }

  buildScehmas(voxels, models);
  buildStatePalette(voxels, models);
  buildReltionalStatePalette(voxels, models);

  const {
    finalModelStateMap,
    finalModelConditionalMap,
    finalVoxelStateInputMap,
    finalVoxelConditionalInputMap,
  } = BuildGeomtryLUT(voxels, geomtry, models);

  for (const voxel of voxels) {
    const voxelModelData = voxel.properties["dve_model_data"];
    if (!voxelModelData) continue;
    const trueVoxelId = VoxelLUT.voxelIds.getNumberId(voxel.id);
    const modelStateMap = finalModelStateMap.get(voxelModelData.id);
    const modelConditonalMap = finalModelConditionalMap.get(voxelModelData.id)!;
    const stateSchema = VoxelSchemas.state.get(voxelModelData.id);
    const reltionalStateSchema = VoxelSchemas.reltioanlState.get(
      voxelModelData.id
    );
    const modSchema = VoxelSchemas.mod.get(voxel.id);
    const reltionalModSchema = VoxelSchemas.reltioanlMod.get(voxel.id);
    const inputs = finalVoxelStateInputMap.get(voxel.id)!;
    const conditonalInputs = finalVoxelConditionalInputMap.get(voxel.id)!;

    for (const modKey in voxelModelData.inputs) {
      const [modString, modReltionalString] = modKey.split("|");
      const modValue = modSchema ? modSchema.readString(modString) : 0;
      const reltionalModValue =
        modReltionalString && reltionalModSchema
          ? reltionalModSchema.readString(modReltionalString)
          : 0;

      for (const stateKey in modelStateMap) {
        const [stateString, reltionalString] = stateKey.split("|");
        const stateValue = stateSchema
          ? stateSchema.readString(stateString)
          : 0;
        const reltionalStateValue =
          reltionalString && reltionalStateSchema
            ? reltionalStateSchema.readString(reltionalString)
            : 0;

    
        const voxelId = VoxelLUT.getVoxelId(trueVoxelId, stateValue, modValue);
        const reltionalVoxelId = VoxelLUT.getReltionalVoxelId(
          trueVoxelId,
          reltionalStateValue,
          reltionalModValue
        );

        VoxelLUT.geomtryIndex[voxelId] ??= [];
        VoxelLUT.geomtryInputsIndex[voxelId] ??= [];
        const totalReltionalStates = reltionalStateSchema
          ? Math.pow(2, reltionalStateSchema.nodes.length)
          : 0;
        if (!totalReltionalStates) {
          VoxelLUT.geomtryIndex[voxelId][reltionalVoxelId] =
            modelStateMap[stateKey];
          VoxelLUT.geomtryInputsIndex[voxelId][reltionalVoxelId] =
            inputs[modKey][stateKey];
        } else {
          const baseReltionalVoxelId = VoxelLUT.getReltionalVoxelId(
            trueVoxelId,
            0,
            0
          );
          for (
            let i = baseReltionalVoxelId;
            i < baseReltionalVoxelId + totalReltionalStates;
            i++
          ) {
            VoxelLUT.geomtryIndex[voxelId][i] = modelStateMap[stateKey];
            VoxelLUT.geomtryInputsIndex[voxelId][i] = inputs[modKey][stateKey];
          }
        }
      }

      for (const stateKey in modelConditonalMap) {
        const [stateString, reltionalString] = stateKey.split("|");

        const stateValue = stateSchema
          ? stateSchema.readString(stateString)
          : 0;
        const reltionalStateValue =
          reltionalString && reltionalStateSchema
            ? reltionalStateSchema.readString(reltionalString)
            : 0;

        const geoId = modelConditonalMap[stateKey];
        const voxelId = VoxelLUT.getVoxelId(trueVoxelId, stateValue, modValue);
        const reltionalVoxelId = VoxelLUT.getReltionalVoxelId(
          trueVoxelId,
          reltionalStateValue,
          reltionalModValue
        );

        const totalReltionalStates = reltionalStateSchema
          ? Math.pow(2, reltionalStateSchema.nodes.length)
          : 0;

        VoxelLUT.conditionalGeomtryInputIndex[geoId] ??= [];
        VoxelLUT.conditionalGeomtryInputIndex[geoId][voxelId] ??= [];
        if (!totalReltionalStates) {
          VoxelLUT.conditionalGeomtryInputIndex[geoId][voxelId][
            reltionalVoxelId
          ] = conditonalInputs[modKey][stateKey];
        } else {
          const baseReltionalVoxelId = VoxelLUT.getReltionalVoxelId(
            trueVoxelId,
            0,
            0
          );
          for (
            let i = baseReltionalVoxelId;
            i < baseReltionalVoxelId + totalReltionalStates;
            i++
          ) {
            VoxelLUT.conditionalGeomtryInputIndex[geoId][voxelId][i] =
              conditonalInputs[modKey][stateKey];
          }
        }
      }
    }

    for (const stateKey in modelConditonalMap) {
      const [stateString, reltionalString] = stateKey.split("|");

      const stateValue = stateSchema ? stateSchema.readString(stateString) : 0;

      const totalReltionalStates = reltionalStateSchema
        ? Math.pow(2, reltionalStateSchema.nodes.length) *
          (reltionalModSchema
            ? Math.pow(2, reltionalModSchema.nodes.length)
            : 1)
        : 0;

      const enabledArray: boolean[] = new Array(totalReltionalStates || 1).fill(
        true
      );

      if (reltionalStateSchema) {
        const reltionalNodes = <[key: string, value: string][]>(
          (reltionalString ? reltionalString.split(",") : []).map((v) =>
            v.split("=")
          )
        );
        for (let i = 0; i < totalReltionalStates; i++) {
          reltionalStateSchema.startEncoding(i);
          for (const [key, value] of reltionalNodes) {
            if (reltionalStateSchema.getValue(key) !== value) {
              enabledArray[i] = false;
            }
          }
        }
      }

      VoxelLUT.conditionalGeomtryIndex[trueVoxelId] ??= [];
      VoxelLUT.conditionalGeomtryIndex[trueVoxelId].push([
        modelConditonalMap[stateKey],
        stateValue,
        enabledArray,
      ]);
    }
  }
}
