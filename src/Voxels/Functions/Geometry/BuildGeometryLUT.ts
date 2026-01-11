import {
  VoxelGeometryLinkData,
  VoxelModelData,
} from "../../Models/VoxelModel.types";
import { VoxelData } from "../../Types/Voxel.types";
import {
  CullingProcedureData,
  VoxelGeometryData,
} from "../../Geometry/VoxelGeometry.types";
import { StringPalette } from "../../../Util/StringPalette";
import { GeometryLUT } from "../../Data/GeometryLUT";
import { VoxelModelInputs } from "./GeometryLUT.types";
import { BuildInputs } from "./Inputs/BuldInputs";
import { BuildCompiled } from "./Compile/BuildCompiled";
import { BuildRules } from "./Rules/BuildRules";
import { VoxelFaceNameArray } from "../../../Math";
import { Vec2Array, Vec4Array } from "@amodx/math";
const getGeometryLinkId = (node: VoxelGeometryLinkData) => {
  return `${node.geometryId}${
    node.cullingProcedure ? JSON.stringify(node.cullingProcedure) : " "
  }${node.position ? `-p${node.position.toString()}` : ""}${
    node.rotation ? `-r${node.rotation.toString()}` : ""
  }${node.scale ? `-s${node.scale.toString()}` : ""}${
    node.flip ? `-f${node.flip.toString()}` : ""
  }`.trim();
};

type MappedVoxelInputs = Record<string, Record<string, VoxelModelInputs[]>>;
type PreFinalMappedVoxelInputs = Record<string, Record<string, number[]>>;
type FinalMappedVoxelInputs = Record<string, Record<string, number>>;

const getVoxelModelInputId = (data: VoxelModelInputs) => {
  let baseId = `${data.geoNodeId}-${data.modelId}`;

  const modelInputKeys = Object.keys(data.modelInputs).sort();
  for (const key of modelInputKeys) {
    baseId += `${key}-${JSON.stringify(data.modelInputs[key])}`;
  }

  const voxelInputKeys = Object.keys(data.voxelInputs).sort();
  for (const key of voxelInputKeys) {
    baseId += `${key}-${JSON.stringify(data.voxelInputs[key])}`;
  }

  return baseId;
};

export function BuildGeomeetryLUT(
  voxels: VoxelData[],
  geomtries: VoxelGeometryData[],
  models: VoxelModelData[]
) {
  const geometryMap = new Map<string, VoxelGeometryData>();
  for (const geometry of geomtries) {
    geometryMap.set(geometry.id, geometry);

    const divisor = geometry.divisor;
    for (const node of geometry.nodes) {
      if (node.type == "box") {
        let d = node.divisor ? node.divisor : divisor;
        if (!d) continue;
        node.points[0][0] /= d[0];
        node.points[0][1] /= d[1];
        node.points[0][2] /= d[2];
        node.points[1][0] /= d[0];
        node.points[1][1] /= d[1];
        node.points[1][2] /= d[2];
        for (const faceName of VoxelFaceNameArray) {
          const data = node.faces[faceName];
          if (Array.isArray(data.uv)) {
            data.uv[0] /= d[0];
            data.uv[1] /= d[1];
            data.uv[2] /= d[0];
            data.uv[3] /= d[1];
          }
        }
        if (node.divisor) node.divisor = undefined;
      }
      if (node.type == "quad") {
        let d = node.divisor ? node.divisor : divisor;
        if (!d) continue;

        for (let i = 0; i < 4; i++) {
          const point = node.points[i];
          point[0] /= d[0];
          point[1] /= d[1];
          point[2] /= d[2];
        }
        if (Array.isArray(node.uv)) {
          if (Array.isArray(node.uv[0])) {
            let uvs = node.uv as any;
            for (let i = 0; i < node.uv.length; i++) {
              uvs[i][0] /= d[0];
              uvs[i][1] /= d[1];
            }
          } else {
            let uvs = node.uv as Vec4Array;
            uvs[0] /= d[0];
            uvs[1] /= d[1];
            uvs[2] /= d[0];
            uvs[3] /= d[1];
          }
        }
        if (node.divisor) node.divisor = undefined;
      }
      if (node.type == "triangle") {
        let d = node.divisor ? node.divisor : divisor;
        if (!d) continue;
        for (let i = 0; i < 4; i++) {
          const point = node.points[i];
          point[0] /= d[0];
          point[1] /= d[1];
          point[2] /= d[2];
        }
        if (Array.isArray(node.uv)) {
          if (Array.isArray(node.uv[0])) {
            let uvs = node.uv as Vec2Array[];
            for (let i = 0; i < node.uv.length; i++) {
              uvs[i][0] /= d[0];
              uvs[i][1] /= d[1];
            }
          }
        }
        if (node.divisor) node.divisor = undefined;
      }
      if (geometry.divisor) geometry.divisor = undefined;
    }
  }

  const modelMap = new Map<string, VoxelModelData>();
  for (const model of models) {
    modelMap.set(model.id, model);

    for (const stateKey in model.stateNodes) {
      const nodes = model.stateNodes[stateKey];
      for (const node of nodes) {
        let d = node.divisor ? node.divisor : model.divisor;
        if (!d) continue;
        if (node.position) {
          node.position[0] /= d[0];
          node.position[1] /= d[1];
          node.position[2] /= d[2];
        }
      }
    }
    for (const stateKey in model.conditonalNodes) {
      const nodes = model.conditonalNodes[stateKey];
      for (const node of nodes) {
        let d = node.divisor ? node.divisor : model.divisor;
        if (!d) continue;
        if (node.position) {
          node.position[0] /= d[0];
          node.position[1] /= d[1];
          node.position[2] /= d[2];
        }
      }
    }
  }

  const modelsProcessed = new Set<string>();
  const modelStateMap = new Map<string, Record<string, number[]>>();
  const modelConditionalMap = new Map<string, Record<string, number[]>>();
  const geometryLinkRecord: VoxelGeometryLinkData[] = [];
  const geometryLinkPalette = new StringPalette();

  const rulelessIndex: boolean[] = [];

  const inputMap = new Map<string, MappedVoxelInputs>();
  const conditionalInputMap = new Map<string, MappedVoxelInputs>();

  const cullingProcedures: CullingProcedureData[] = [
    {
      type: "default",
    },
    {
      type: "none",
    },
    {
      type: "transparent",
    },
  ];
  const cullProcedurePalette = new StringPalette();
  for (const procedure of cullingProcedures) {
    cullProcedurePalette.register(procedure.type);
  }
  GeometryLUT.geometryCullingProcedures = cullingProcedures;
  for (const voxel of voxels) {
    const voxelModelData = voxel.properties["dve_model_data"];
    if (!voxelModelData) continue;
    const model = modelMap.get(voxelModelData.id)!;

    if (!modelsProcessed.has(voxelModelData.id)) {
      modelsProcessed.add(voxelModelData.id);
      const stateNodes: Record<string, number[]> = {};

      for (const state in model.stateNodes) {
        const nodes = model.stateNodes[state];
        const nodeIds: number[] = [];
        for (const node of nodes) {
          const getLinkId = getGeometryLinkId(node);
          const getLinkPaletteId = geometryLinkPalette.register(getLinkId);
          geometryLinkRecord[getLinkPaletteId] = node;
          nodeIds.push(getLinkPaletteId);

          const cullingProcedure = node.cullingProcedure
            ? node.cullingProcedure
            : geometryMap.get(node.geometryId)?.cullingProcedure ||
              cullingProcedures[0];
          GeometryLUT.geometryCullingProceduresIndex[getLinkPaletteId] =
            cullProcedurePalette.getNumberId(cullingProcedure.type);

          if (geometryMap.get(node.geometryId)?.doNotBuildRules) {
            rulelessIndex[getLinkPaletteId] = true;
          } else {
            rulelessIndex[getLinkPaletteId] = false;
          }
        }
        nodeIds.sort();
        stateNodes[state] = nodeIds;
      }
      modelStateMap.set(model.id, stateNodes);
      const conditionalStateNodes: Record<string, number[]> = {};
      for (const state in model.conditonalNodes) {
        const nodes = model.conditonalNodes[state];
        const nodeIds: number[] = [];
        for (const node of nodes) {
          const getLinkId = getGeometryLinkId(node);
          const getLinkPaletteId = geometryLinkPalette.register(getLinkId);
          geometryLinkRecord[getLinkPaletteId] = node;
          nodeIds.push(getLinkPaletteId);

          const cullingProcedure = node.cullingProcedure
            ? node.cullingProcedure
            : geometryMap.get(node.geometryId)?.cullingProcedure ||
              cullingProcedures[0];
          GeometryLUT.geometryCullingProceduresIndex[getLinkPaletteId] =
            cullProcedurePalette.getNumberId(cullingProcedure.type);

          if (geometryMap.get(node.geometryId)?.doNotBuildRules) {
            rulelessIndex[getLinkPaletteId] = true;
          } else {
            rulelessIndex[getLinkPaletteId] = false;
          }
        }
        nodeIds.sort();
        conditionalStateNodes[state] = nodeIds;
      }
      modelConditionalMap.set(model.id, conditionalStateNodes);
    }

    const voxelInputStates: MappedVoxelInputs = {};
    const conditonalVoxelInputStates: MappedVoxelInputs = {};
    for (const mod in voxelModelData.inputs) {
      const voxelInputs = voxelModelData.inputs[mod];
      const voxelStateInputs: Record<string, VoxelModelInputs[]> = {};
      for (const state in model.stateNodes) {
        const nodes = model.stateNodes[state];
        const inputs: VoxelModelInputs[] = [];
        for (const node of nodes) {
          const getLinkId = getGeometryLinkId(node);
          const getLinkPaletteId = geometryLinkPalette.getNumberId(getLinkId);

          inputs.push({
            geoNodeId: getLinkPaletteId,
            modelId: model.id,
            geometryId: node.geometryId,
            voxelInputs: voxelInputs,
            modelInputs: node.inputs,
          });
        }
        voxelStateInputs[state] = inputs;
      }
      voxelInputStates[mod] = voxelStateInputs;
      const conditonalVoxelStateInputs: Record<string, VoxelModelInputs[]> = {};
      for (const state in model.conditonalNodes) {
        const nodes = model.conditonalNodes[state];
        const inputs: VoxelModelInputs[] = [];
        for (const node of nodes) {
          const getLinkId = getGeometryLinkId(node);
          const getLinkPaletteId = geometryLinkPalette.getNumberId(getLinkId);
          inputs.push({
            geoNodeId: getLinkPaletteId,
            modelId: model.id,
            geometryId: node.geometryId,
            voxelInputs: voxelInputs,
            modelInputs: node.inputs,
          });
        }
        conditonalVoxelStateInputs[state] = inputs;
      }

      conditonalVoxelInputStates[mod] = conditonalVoxelStateInputs;
    }
    inputMap.set(voxel.id, voxelInputStates);
    conditionalInputMap.set(voxel.id, conditonalVoxelInputStates);
  }

  //build final

  const finalModelStateMap = new Map<string, Record<string, number>>();
  const finalModelConditionalMap = new Map<string, Record<string, number>>();

  const geometryIndex: number[][] = [];
  const finalGeometryPalette = new StringPalette();

  for (const [model, values] of modelStateMap) {
    const finalStateMap: Record<string, number> = {};
    for (const state in values) {
      const geoIds = values[state];
      const geoIdsString = geoIds.toString();
      const geoFinalId = finalGeometryPalette.register(geoIdsString);
      geometryIndex[geoFinalId] = geoIds;
      finalStateMap[state] = geoFinalId;
    }
    finalModelStateMap.set(model, finalStateMap);
  }

  for (const [model, values] of modelConditionalMap) {
    const finalStateMap: Record<string, number> = {};
    for (const state in values) {
      const geoIds = values[state];
      const geoIdsString = geoIds.toString();
      const geoFinalId = finalGeometryPalette.register(geoIdsString);
      geometryIndex[geoFinalId] = geoIds;
      finalStateMap[state] = geoFinalId;
    }
    finalModelConditionalMap.set(model, finalStateMap);
  }

  //prepare to build final inputs
  const preFinalVoxelStateInputMap = new Map<
    string,
    PreFinalMappedVoxelInputs
  >();
  const preFinalVoxelConditionalInputMap = new Map<
    string,
    PreFinalMappedVoxelInputs
  >();

  const inputRecord: VoxelModelInputs[] = [];
  const finalGeometryInputPalette = new StringPalette();

  for (const [voxel, inputs] of inputMap) {
    const finalInputs: PreFinalMappedVoxelInputs = {};
    for (const mod in inputs) {
      finalInputs[mod] = {};
      const states = inputs[mod];
      for (const state in states) {
        const inputs: number[] = [];
        const voxelInputs = states[state];
        for (const input of voxelInputs) {
          const inputId = getVoxelModelInputId(input);
          const finalInputId = finalGeometryInputPalette.register(inputId);
          inputs.push(finalInputId);
          inputRecord[finalInputId] = input;
        }
        inputs.sort();
        finalInputs[mod][state] = inputs;
      }
    }
    preFinalVoxelStateInputMap.set(voxel, finalInputs);
  }

  for (const [voxel, inputs] of conditionalInputMap) {
    const finalInputs: PreFinalMappedVoxelInputs = {};
    for (const mod in inputs) {
      finalInputs[mod] = {};
      const states = inputs[mod];
      for (const state in states) {
        const inputs: number[] = [];
        const voxelInputs = states[state];
        for (const input of voxelInputs) {
          const inputId = getVoxelModelInputId(input);
          const finalInputId = finalGeometryInputPalette.register(inputId);
          inputs.push(finalInputId);
          inputRecord[finalInputId] = input;
        }
        inputs.sort();
        finalInputs[mod][state] = inputs;
      }
    }
    preFinalVoxelConditionalInputMap.set(voxel, finalInputs);
  }

  //build final inputs
  const finalVoxelStateInputMap = new Map<string, FinalMappedVoxelInputs>();
  const finalVoxelConditionalInputMap = new Map<
    string,
    FinalMappedVoxelInputs
  >();

  const inputIndex: number[][] = [];
  const finalInputPalette = new StringPalette();

  for (const [voxel, inputs] of preFinalVoxelStateInputMap) {
    const finalInputs: FinalMappedVoxelInputs = {};
    for (const mod in inputs) {
      finalInputs[mod] = {};
      const states = inputs[mod];
      for (const state in states) {
        const inputIds = inputs[mod][state];
        const inputsStringId = inputIds.toString();
        const inputsFinalId = finalInputPalette.register(inputsStringId);
        finalInputs[mod][state] = inputsFinalId;
        inputIndex[inputsFinalId] = inputIds;
      }
    }
    finalVoxelStateInputMap.set(voxel, finalInputs);
  }

  for (const [voxel, inputs] of preFinalVoxelConditionalInputMap) {
    const finalInputs: FinalMappedVoxelInputs = {};
    for (const mod in inputs) {
      finalInputs[mod] = {};
      const states = inputs[mod];
      for (const state in states) {
        const inputIds = inputs[mod][state];
        const inputsStringId = inputIds.toString();
        const inputsFinalId = finalInputPalette.register(inputsStringId);
        finalInputs[mod][state] = inputsFinalId;
        inputIndex[inputsFinalId] = inputIds;
      }
    }
    finalVoxelConditionalInputMap.set(voxel, finalInputs);
  }

  GeometryLUT.geometryIndex = geometryIndex;
  GeometryLUT.geometryInputsIndex = inputIndex;

  //Build compiled geometry
  const finalCompiledData: any[][] = [];

  for (let i = 0; i < geometryLinkRecord.length; i++) {
    const geoLinkData = geometryLinkRecord[i];
    finalCompiledData[i] = BuildCompiled(
      geoLinkData,
      geometryMap.get(geoLinkData.geometryId)!
    );
  }
  GeometryLUT.compiledGeometry = finalCompiledData;

  //Build geometry inputs
  const finalInputData: any[][] = [];

  for (let i = 0; i < inputRecord.length; i++) {
    const inputs = inputRecord[i];
    const geoLinkData = geometryLinkRecord[inputs.geoNodeId];
    finalInputData[i] = BuildInputs(
      geoLinkData,
      inputs,
      modelMap.get(inputs.modelId)!,
      geometryMap.get(inputs.geometryId)!
    );
  }
  GeometryLUT.geometryInputs = finalInputData;

  //Build Rules
  BuildRules();

  return {
    finalModelStateMap,
    finalModelConditionalMap,
    finalVoxelStateInputMap,
    finalVoxelConditionalInputMap,
  };
}
