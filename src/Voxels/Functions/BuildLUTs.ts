import { VoxelModelData } from "../Models/VoxelModel.types";
import { VoxelData } from "../Types/Voxel.types";
import { VoxelLUT } from "../Data/VoxelLUT";
import { BinarySchema } from "../State/Schema/BinarySchema";
import { VoxelBinaryStateSchemaNode } from "../State/State.types";
import { VoxelSchemas } from "../State/VoxelSchemas";
import { EngineStats } from "../../Stats/EngineStats";
import { VoxelGeometryData } from "../Geometry/VoxelGeometry.types";
import { BuildGeomeetryLUT } from "./Geometry/BuildGeometryLUT";
import { VoxelMaterialData } from "../Types/VoxelMaterial.types";
import { VoxelSubstanceData } from "../Types/VoxelSubstances.types";
import { ReltionalStateBuilder } from "../State/Reltional/ReltionalStateBuilder";
import { EngineSettings } from "../../Settings/EngineSettings";

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
  const totalModelStates = new Map<string, number>();
  const totalModelRelationalStates = new Map<string, number>();
  VoxelLUT.models.register("dve_air");
  VoxelLUT.modelsIndex[0] = 0;
  VoxelLUT.modelStateMaps[0] = new Map([[0, 0]]);
  VoxelLUT.modelRelationalStateMaps[0] = new Map([[0, 0]]);
  VoxelLUT.voxelModMaps[0] = new Map([[0, 0]]);
  VoxelLUT.voxelRelationalModMaps[0] = new Map([[0, 0]]);
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
    totalModelStates.set(model.id, stateSchema.totalStates());

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
    VoxelSchemas.relationalState.set(model.id, reltionalStateSchema);
    totalModelRelationalStates.set(model.id, stateSchema.totalStates());

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
    VoxelLUT.voxelIdToNameMap.set(voxel.id, voxel.name || voxel.id);
    VoxelLUT.voxelNametoIdMap.set(voxel.name || voxel.id, voxel.id);

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
    VoxelLUT.totalVoxelIds +=
      (totalModelStates.get(modelData.id)! || 1) *
      (stateSchema.totalStates() || 1);

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
    VoxelSchemas.relationalMod.set(voxel.id, reltionalStateSchema);
    VoxelLUT.totalRelationalVoxelIds +=
      (totalModelRelationalStates.get(modelData.id)! || 1) *
      (reltionalStateSchema.totalStates() || 1);

    const reltionalModBuilder = new ReltionalStateBuilder(
      reltionalStateSchema,
      modelData.modRelationSchema || []
    );
    VoxelSchemas.reltionalModBuilder.set(voxel.id, reltionalModBuilder);
  }

  VoxelSchemas.buildMaps();
}

function getUint16Buffer(size: number) {
  if (EngineSettings.settings.memoryAndCPU.useSharedMemory)
    return new SharedArrayBuffer(size * 2);
  return new ArrayBuffer(size * 2);
}

function buildStatePalette(voxels: VoxelData[], models: VoxelModelData[]) {
  const modelStateArray = new Map<string, number[]>();

  VoxelLUT.totalMods = new Uint16Array(getUint16Buffer(VoxelLUT.voxelIds.size));
  VoxelLUT.totalStates = new Uint16Array(
    getUint16Buffer(VoxelLUT.voxelIds.size)
  );
  VoxelLUT.voxelIdToTrueId = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );
  VoxelLUT.voxelIdToState = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );
  VoxelLUT.voxelIdToMod = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );
  VoxelLUT.voxelRecordStartIndex = new Uint16Array(
    getUint16Buffer(VoxelLUT.voxelIds.size)
  );
  VoxelLUT.voxelRecord = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );

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

    const stateMap = new Map<number, number>();
    for (let i = 0; i < statePalette.length; i++) {
      stateMap.set(statePalette[i], i);
    }
    const modelId = VoxelLUT.models.getNumberId(model.id);
    VoxelLUT.modelStateMaps[modelId] = stateMap;
  }

  let voxelIdCount = 1;
  let voxelRecordStateIndex = 0;
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
    const modMap = new Map<number, number>();
    for (let i = 0; i < modPalette.length; i++) {
      modMap.set(modPalette[i], i);
    }
    VoxelLUT.voxelModMaps[voxelId] = modMap;

    const statePalette = modelStateArray.get(modelData.id)!;

    VoxelLUT.totalStates[voxelId] = statePalette.length;
    VoxelLUT.totalMods[voxelId] = modPalette.length;
    VoxelLUT.voxelRecordStartIndex[voxelId] = voxelRecordStateIndex;

    for (let modIndex = 0; modIndex < modPalette.length; modIndex++) {
      for (let stateIndex = 0; stateIndex < statePalette.length; stateIndex++) {
        VoxelLUT.voxelIdToTrueId[voxelIdCount] = voxelId;
        VoxelLUT.voxelIdToState[voxelIdCount] = statePalette[stateIndex];
        VoxelLUT.voxelIdToMod[voxelIdCount] = modPalette[modIndex];
        VoxelLUT.voxelRecord[
          voxelRecordStateIndex +
            VoxelLUT.getStateIndex(stateIndex, modIndex, statePalette.length)
        ] = voxelIdCount;
        voxelIdCount++;
      }
    }
    voxelRecordStateIndex +=
      (modPalette.length || 1) * (statePalette.length || 1);
  }

  EngineStats.palette.paletteSize = VoxelLUT.totalVoxelIds;
}

function buildReltionalStatePalette(
  voxels: VoxelData[],
  models: VoxelModelData[]
) {
  const modelStateArray = new Map<string, number[]>();

  VoxelLUT.totalReltionalMods = new Uint16Array(
    getUint16Buffer(VoxelLUT.voxelIds.size)
  );
  VoxelLUT.totalReltionalStates = new Uint16Array(
    getUint16Buffer(VoxelLUT.voxelIds.size)
  );
  VoxelLUT.relationalVoxelIdToTrueId = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );
  VoxelLUT.relationalVoxelIdToState = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );
  VoxelLUT.relationalVoxelIdToMod = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );
  VoxelLUT.relationalVoxelRecordStartIndex = new Uint16Array(
    getUint16Buffer(VoxelLUT.voxelIds.size)
  );
  VoxelLUT.relationalVoxelRecord = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalVoxelIds)
  );

  for (const model of models) {
    const schema = VoxelSchemas.relationalState.get(model.id)!;

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

    const stateMap = new Map<number, number>();
    for (let i = 0; i < statePalette.length; i++) {
      stateMap.set(statePalette[i], i);
    }
    const modelId = VoxelLUT.models.getNumberId(model.id);
    VoxelLUT.modelRelationalStateMaps[modelId] = stateMap;
  }

  let voxelIdCount = 1;
  let voxelRecordStateIndex = 0;
  for (const voxel of voxels) {
    const modelData = voxel.properties["dve_model_data"];
    if (!modelData) continue;
    const schema = VoxelSchemas.relationalMod.get(voxel.id);
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
    const modMap = new Map<number, number>();
    for (let i = 0; i < modPalette.length; i++) {
      modMap.set(modPalette[i], i);
    }
    VoxelLUT.voxelRelationalModMaps[voxelId] = modMap;

    const statePalette = modelStateArray.get(modelData.id)!;

    VoxelLUT.totalReltionalStates[voxelId] = statePalette.length;
    VoxelLUT.totalReltionalMods[voxelId] = modPalette.length;
    VoxelLUT.relationalVoxelRecordStartIndex[voxelId] = voxelRecordStateIndex;

    for (let modIndex = 0; modIndex < modPalette.length; modIndex++) {
      for (let stateIndex = 0; stateIndex < statePalette.length; stateIndex++) {
        VoxelLUT.relationalVoxelIdToTrueId[voxelIdCount] = voxelId;
        VoxelLUT.relationalVoxelIdToState[voxelIdCount] =
          statePalette[stateIndex];
        VoxelLUT.relationalVoxelIdToMod[voxelIdCount] = modPalette[modIndex];
        VoxelLUT.relationalVoxelRecord[
          voxelRecordStateIndex +
            VoxelLUT.getStateIndex(stateIndex, modIndex, statePalette.length)
        ] = voxelIdCount;
        voxelIdCount++;
      }
    }
    voxelRecordStateIndex +=
      (modPalette.length || 1) * (statePalette.length || 1);
  }

  EngineStats.palette.reltionalPaletteSize = VoxelLUT.totalRelationalVoxelIds;
}

export function BuildLUTs(
  materials: VoxelMaterialData[],
  substances: VoxelSubstanceData[],
  voxels: VoxelData[],
  geometry: VoxelGeometryData[],
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

  VoxelLUT.totalCombinedIds =
    VoxelLUT.totalVoxelIds * VoxelLUT.totalRelationalVoxelIds;

  VoxelLUT.geometryIndex = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalCombinedIds)
  );

  VoxelLUT.geometryInputsIndex = new Uint16Array(
    getUint16Buffer(VoxelLUT.totalCombinedIds)
  );

  const {
    finalModelStateMap,
    finalModelConditionalMap,
    finalVoxelStateInputMap,
    finalVoxelConditionalInputMap,
  } = BuildGeomeetryLUT(voxels, geometry, models);

  for (const voxel of voxels) {
    const voxelModelData = voxel.properties["dve_model_data"];
    if (!voxelModelData) continue;
    const trueVoxelId = VoxelLUT.voxelIds.getNumberId(voxel.id);
    const modelStateMap = finalModelStateMap.get(voxelModelData.id);
    const modelConditonalMap = finalModelConditionalMap.get(voxelModelData.id)!;
    const stateSchema = VoxelSchemas.state.get(voxelModelData.id);
    const reltionalStateSchema = VoxelSchemas.relationalState.get(
      voxelModelData.id
    );
    const modSchema = VoxelSchemas.mod.get(voxel.id);
    const reltionalModSchema = VoxelSchemas.relationalMod.get(voxel.id);
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

        const totalReltionalStates = reltionalStateSchema
          ? Math.pow(2, reltionalStateSchema.nodes.length)
          : 0;
        if (!totalReltionalStates) {
          VoxelLUT.geometryIndex[
            VoxelLUT.getStateIndex(
              voxelId,
              reltionalVoxelId,
              VoxelLUT.totalVoxelIds
            )
          ] = modelStateMap[stateKey];
          VoxelLUT.geometryInputsIndex[
            VoxelLUT.getStateIndex(
              voxelId,
              reltionalVoxelId,
              VoxelLUT.totalVoxelIds
            )
          ] = inputs[modKey][stateKey];
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
            VoxelLUT.geometryIndex[
              VoxelLUT.getStateIndex(voxelId, i, VoxelLUT.totalVoxelIds)
            ] = modelStateMap[stateKey];
            VoxelLUT.geometryInputsIndex[
              VoxelLUT.getStateIndex(voxelId, i, VoxelLUT.totalVoxelIds)
            ] = inputs[modKey][stateKey];
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

        VoxelLUT.conditionalGeometryInputIndex[geoId] ??= [];
        VoxelLUT.conditionalGeometryInputIndex[geoId][voxelId] ??= [];
        if (!totalReltionalStates) {
          VoxelLUT.conditionalGeometryInputIndex[geoId][voxelId][
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
            VoxelLUT.conditionalGeometryInputIndex[geoId][voxelId][i] =
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

      const modelId = VoxelLUT.models.getNumberId(voxelModelData.id);
      VoxelLUT.conditionalGeometryIndex[modelId] ??= [];
      VoxelLUT.conditionalGeometryIndex[modelId].push([
        modelConditonalMap[stateKey],
        stateValue,
        enabledArray,
      ]);
    }
  }
}
