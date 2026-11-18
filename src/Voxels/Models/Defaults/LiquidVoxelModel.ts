import {  VoxelModelData } from "../VoxelModel.types";
import { VoxelGeometryData } from "../../Geometry/VoxelGeometry.types";
export type LiquidVoxelModelArgs = {
  stillTexture: number;
  flowTexture: number;
};
export const liquidGeometry: VoxelGeometryData = {
  id: "dve_liquid",
  arguments: {
    stillTexture: {
      type: "texture",
    },
    flowTexture: {
      type: "texture",
    },
  },
  nodes: [
    {
      type: "custom",
      id: "liquid",
      inputs: {
        stillTexture: "@stillTexture",
        flowTexture: "@flowTexture",
      },
    },
  ],
};

export const liquidModel: VoxelModelData = {
  id: "dve_liquid",
  relationsSchema: [],
  stateSchema: [],
  arguments: {
    stillTexture: {
      type: "texture",
    },
    flowTexture: {
      type: "texture",
    },
  },
  conditionalNodes: {},
  properties: {
    dve_placing_strategy: "*",
    // Without this liquids use the default behavior and never flow.
    dve_simulation_behavior: "dve_liquid",
  },
  stateNodes: {
    "*": [
      {
        geometryId: "dve_liquid",
        inputs: {
          stillTexture: "@stillTexture",
          flowTexture: "@flowTexture",
        },
      },
    ],
  },
};
