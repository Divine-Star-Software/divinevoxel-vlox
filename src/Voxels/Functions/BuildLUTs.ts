import { VoxelModelData } from "../Models/VoxelModel.types";
import { VoxelData } from "../Types/Voxel.types";
import { VoxelLUT } from "../Data/VoxelLUT";
import { BinarySchema } from "../State/Schema/BinarySchema";
import { VoxelBinaryStateSchemaNode } from "../State/State.types";
import { VoxelSchemas } from "../State/VoxelSchemas";
import { EngineStats } from "../../Stats/EngineStats";
import { VoxelGeometryData } from "../Geometry/VoxelGeometry.types";
import { BuildGeometryLUT } from "./Geometry/BuildGeometryLUT";
import { VoxelMaterialData } from "../Types/VoxelMaterial.types";
import { VoxelSubstanceData } from "../Types/VoxelSubstances.types";
import { RelationalStateBuilder } from "../State/Relational/RelationalStateBuilder";
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

function buildSchemas(voxels: VoxelData[], models: VoxelModelData[]) {
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

    //build relational state schema
    const relationalSchemaNodes: VoxelBinaryStateSchemaNode[] = [];
    let bitIndex = 0;
    for (const schemaNode of model.relationsSchema) {
      const node: VoxelBinaryStateSchemaNode = {
        name: schemaNode.name,
        bitIndex: bitIndex,
        bitSize: 1,
        values: ["false", "true"],
      };
      bitIndex++;
      relationalSchemaNodes.push(node);
    }
    const relationalStateSchema = new BinarySchema(relationalSchemaNodes);
    VoxelSchemas.relationalState.set(model.id, relationalStateSchema);
    totalModelRelationalStates.set(model.id, stateSchema.totalStates());

    const relationalStateBuilder = new RelationalStateBuilder(
      relationalStateSchema,
      model.relationsSchema
    );
    VoxelSchemas.relationalStateBuilder.set(model.id, relationalStateBuilder);
  }

  //build mod schemas
  for (const voxel of voxels) {
    const modelData = voxel.properties["dve_model_data"];
    const trueVoxelId = VoxelLUT.voxelIds.register(voxel.id);
    VoxelLUT.voxelIdToNameMap.set(voxel.id, voxel.name || voxel.id);
    VoxelLUT.voxelNameToIdMap.set(voxel.name || voxel.id, voxel.id);

    VoxelLUT.materialMap[trueVoxelId] = VoxelLUT.material.getNumberId(
      voxel.properties["dve_rendered_material"] || "dve_solid"
    );
    VoxelLUT.substanceMap[trueVoxelId] = VoxelLUT.substance.getNumberId(
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

    //build relational mod schema
    const relationalSchemaNodes: VoxelBinaryStateSchemaNode[] = [];
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
        relationalSchemaNodes.push(node);
      }
    }
    const relationalStateSchema = new BinarySchema(relationalSchemaNodes);
    VoxelSchemas.relationalMod.set(voxel.id, relationalStateSchema);
    VoxelLUT.totalRelationalVoxelIds +=
      (totalModelRelationalStates.get(modelData.id)! || 1) *
      (relationalStateSchema.totalStates() || 1);

    const relationalModBuilder = new RelationalStateBuilder(
      relationalStateSchema,
      modelData.modRelationSchema || []
    );
    VoxelSchemas.relationalModBuilder.set(voxel.id, relationalModBuilder);
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

function buildRelationalStatePalette(
  voxels: VoxelData[],
  models: VoxelModelData[]
) {
  const modelStateArray = new Map<string, number[]>();

  VoxelLUT.totalRelationalMods = new Uint16Array(
    getUint16Buffer(VoxelLUT.voxelIds.size)
  );
  VoxelLUT.totalRelationalStates = new Uint16Array(
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

    VoxelLUT.totalRelationalStates[voxelId] = statePalette.length;
    VoxelLUT.totalRelationalMods[voxelId] = modPalette.length;
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

  EngineStats.palette.relationalPaletteSize = VoxelLUT.totalRelationalVoxelIds;
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

  buildSchemas(voxels, models);
  buildStatePalette(voxels, models);
  buildRelationalStatePalette(voxels, models);

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
  } = BuildGeometryLUT(voxels, geometry, models);

  for (const voxel of voxels) {
    const voxelModelData = voxel.properties["dve_model_data"];
    if (!voxelModelData) continue;
    const trueVoxelId = VoxelLUT.voxelIds.getNumberId(voxel.id);
    const modelStateMap = finalModelStateMap.get(voxelModelData.id);
    const modelConditionalMap = finalModelConditionalMap.get(voxelModelData.id)!;
    const stateSchema = VoxelSchemas.state.get(voxelModelData.id);
    const relationalStateSchema = VoxelSchemas.relationalState.get(
      voxelModelData.id
    );
    const modSchema = VoxelSchemas.mod.get(voxel.id);
    const relationalModSchema = VoxelSchemas.relationalMod.get(voxel.id);
    const inputs = finalVoxelStateInputMap.get(voxel.id)!;
    const conditionalInputs = finalVoxelConditionalInputMap.get(voxel.id)!;

    for (const modKey in voxelModelData.inputs) {
      const [modString, modRelationalString] = modKey.split("|");
      const modValue = modSchema ? modSchema.readString(modString) : 0;
      const relationalModValue =
        modRelationalString && relationalModSchema
          ? relationalModSchema.readString(modRelationalString)
          : 0;

      for (const stateKey in modelStateMap) {
        const [stateString, relationalString] = stateKey.split("|");
        const stateValue = stateSchema
          ? stateSchema.readString(stateString)
          : 0;
        const relationalStateValue =
          relationalString && relationalStateSchema
            ? relationalStateSchema.readString(relationalString)
            : 0;

        const voxelId = VoxelLUT.getVoxelId(trueVoxelId, stateValue, modValue);
        const relationalVoxelId = VoxelLUT.getRelationalVoxelId(
          trueVoxelId,
          relationalStateValue,
          relationalModValue
        );

        const totalRelationalStates = relationalStateSchema
          ? Math.pow(2, relationalStateSchema.nodes.length)
          : 0;
        if (!totalRelationalStates) {
          VoxelLUT.geometryIndex[
            VoxelLUT.getStateIndex(
              voxelId,
              relationalVoxelId,
              VoxelLUT.totalVoxelIds
            )
          ] = modelStateMap[stateKey];
          VoxelLUT.geometryInputsIndex[
            VoxelLUT.getStateIndex(
              voxelId,
              relationalVoxelId,
              VoxelLUT.totalVoxelIds
            )
          ] = inputs[modKey][stateKey];
        } else {
          const baseRelationalVoxelId = VoxelLUT.getRelationalVoxelId(
            trueVoxelId,
            0,
            0
          );
          for (
            let i = baseRelationalVoxelId;
            i < baseRelationalVoxelId + totalRelationalStates;
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

      for (const stateKey in modelConditionalMap) {
        const [stateString, relationalString] = stateKey.split("|");

        const stateValue = stateSchema
          ? stateSchema.readString(stateString)
          : 0;
        const relationalStateValue =
          relationalString && relationalStateSchema
            ? relationalStateSchema.readString(relationalString)
            : 0;

        const geoId = modelConditionalMap[stateKey];
        const voxelId = VoxelLUT.getVoxelId(trueVoxelId, stateValue, modValue);
        const relationalVoxelId = VoxelLUT.getRelationalVoxelId(
          trueVoxelId,
          relationalStateValue,
          relationalModValue
        );

        const totalRelationalStates = relationalStateSchema
          ? Math.pow(2, relationalStateSchema.nodes.length)
          : 0;

        VoxelLUT.conditionalGeometryInputIndex[geoId] ??= [];
        VoxelLUT.conditionalGeometryInputIndex[geoId][voxelId] ??= [];
        if (!totalRelationalStates) {
          VoxelLUT.conditionalGeometryInputIndex[geoId][voxelId][
            relationalVoxelId
          ] = conditionalInputs[modKey][stateKey];
        } else {
          const baseRelationalVoxelId = VoxelLUT.getRelationalVoxelId(
            trueVoxelId,
            0,
            0
          );
          for (
            let i = baseRelationalVoxelId;
            i < baseRelationalVoxelId + totalRelationalStates;
            i++
          ) {
            VoxelLUT.conditionalGeometryInputIndex[geoId][voxelId][i] =
              conditionalInputs[modKey][stateKey];
          }
        }
      }
    }

    for (const stateKey in modelConditionalMap) {
      const [stateString, relationalString] = stateKey.split("|");

      const stateValue = stateSchema ? stateSchema.readString(stateString) : 0;

      const totalRelationalStates = relationalStateSchema
        ? Math.pow(2, relationalStateSchema.nodes.length) *
          (relationalModSchema
            ? Math.pow(2, relationalModSchema.nodes.length)
            : 1)
        : 0;

      const enabledArray: boolean[] = new Array(totalRelationalStates || 1).fill(
        true
      );

      if (relationalStateSchema) {
        const relationalNodes = <[key: string, value: string][]>(
          (relationalString ? relationalString.split(",") : []).map((v) =>
            v.split("=")
          )
        );
        for (let i = 0; i < totalRelationalStates; i++) {
          relationalStateSchema.startEncoding(i);
          for (const [key, value] of relationalNodes) {
            if (relationalStateSchema.getValue(key) !== value) {
              enabledArray[i] = false;
            }
          }
        }
      }

      const modelId = VoxelLUT.models.getNumberId(voxelModelData.id);
      VoxelLUT.conditionalGeometryIndex[modelId] ??= [];
      VoxelLUT.conditionalGeometryIndex[modelId].push([
        modelConditionalMap[stateKey],
        stateValue,
        enabledArray,
      ]);
    }
  }
}
