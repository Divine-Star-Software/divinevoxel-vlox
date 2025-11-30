import { VoxelModelData } from "../VoxelModel.types";

export const simpleThinPannel: VoxelModelData = {
  id: "dve_simple_thin_panel",
  relationsSchema: [],
  stateSchema: [
    {
      name: "placement",
      bitIndex: 0,
      bitSize: 3,
      values: ["down", "up", "north", "south", "east", "west"],
    },
  ],
  arguments: {
    upDownTextures: {
      type: "texture",
    },
    sideTextures: {
      type: "texture",
    },
  },
  properties: {
    dve_placing_strategy: "*",
  },
  conditonalNodes: {},
  stateNodes: {
    "placement=south": [
      {
        geometryId: "dve_thin_panel",
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=north": [
      {
        geometryId: "dve_thin_panel",
        rotation: [0, 180, 0],
        position: [0, 0, (16 - 3) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=west": [
      {
        geometryId: "dve_thin_panel",
        rotation: [0, 90, 0],
        position: [(-8 + 3 / 2) / 16, 0, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=east": [
      {
        geometryId: "dve_thin_panel",
        rotation: [0, -90, 0],
        position: [(8 - 3 / 2) / 16, 0, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=down": [
      {
        geometryId: "dve_thin_panel",
        rotation: [90, 0, 0],
        position: [0, (-8 + 3 / 2) / 16, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=up": [
      {
        geometryId: "dve_thin_panel",
        rotation: [-90, 0, 0],
        position: [0, (8 - 3 / 2) / 16, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
  },
};
export const simpleTransparentThinPannel: VoxelModelData = {
  id: "dve_simple_transparent_thin_panel",
  relationsSchema: [],
  stateSchema: [
    {
      name: "placement",
      bitIndex: 0,
      bitSize: 3,
      values: ["down", "up", "north", "south", "east", "west"],
    },
  ],
  arguments: {
    upDownTextures: {
      type: "texture",
    },
    sideTextures: {
      type: "texture",
    },
  },
  properties: {
    dve_placing_strategy: "*",
  },
  conditonalNodes: {},
  stateNodes: {
    "placement=south": [
      {
        geometryId: "dve_thin_panel",
        cullingProcedure: {
          type: "transparent",
        },
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=north": [
      {
        geometryId: "dve_thin_panel",
        cullingProcedure: {
          type: "transparent",
        },
        rotation: [0, 180, 0],
        position: [0, 0, (16 - 3) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=west": [
      {
        geometryId: "dve_thin_panel",
        cullingProcedure: {
          type: "transparent",
        },
        rotation: [0, 90, 0],
        position: [(-8 + 3 / 2) / 16, 0, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=east": [
      {
        geometryId: "dve_thin_panel",
        cullingProcedure: {
          type: "transparent",
        },
        rotation: [0, -90, 0],
        position: [(8 - 3 / 2) / 16, 0, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=down": [
      {
        geometryId: "dve_thin_panel",
        cullingProcedure: {
          type: "transparent",
        },
        rotation: [90, 0, 0],
        position: [0, (-8 + 3 / 2) / 16, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
    "placement=up": [
      {
        geometryId: "dve_thin_panel",
        cullingProcedure: {
          type: "transparent",
        },
        rotation: [-90, 0, 0],
        position: [0, (8 - 3 / 2) / 16, (8 - 3 / 2) / 16],
        inputs: {
          upTex: "@upDownTextures",
          downTex: "@upDownTextures",
          northTex: "@sideTextures",
          southTex: "@sideTextures",
          eastTex: "@sideTextures",
          westTex: "@sideTextures",
        },
      },
    ],
  },
};
export const simpleCrossedPannel: VoxelModelData = {
  id: "dve_simple_crossed_panels",
  relationsSchema: [],
  stateSchema: [],
  properties: {
    dve_placing_strategy: "*",
  },
  arguments: {
    texture: {
      type: "texture",
    },
    doubleSided: {
      type: "boolean",
      default: false,
    },
  },
  conditonalNodes: {},
  stateNodes: {
    "*": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],
  },
};

export const orientedCrossedPannel: VoxelModelData = {
  id: "dve_oriented_crossed_panels",
  relationsSchema: [],
  properties: {
    dve_placing_strategy: "*",
  },
  stateSchema: [
    {
      name: "placement",
      bitIndex: 0,
      bitSize: 3,
      values: ["down", "up", "north", "south", "east", "west"],
    },
    {
      name: "direction",
      bitIndex: 3,
      bitSize: 2,
      values: ["north", "south", "east", "west"],
    },
  ],
  arguments: {
    texture: {
      type: "texture",
    },
    doubleSided: {
      type: "boolean",
      default: false,
    },
  },
  conditonalNodes: {},

  stateNodes: {
    "placement=down,direction=north": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=down,direction=south": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=down,direction=east": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=down,direction=west": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=up,direction=north": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=up,direction=south": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],

    "placement=up,direction=east": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=up,direction=west": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=north,direction=north": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=north,direction=south": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
    ],

    "placement=north,direction=east": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=north,direction=west": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=south,direction=north": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=south,direction=south": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=south,direction=east": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=south,direction=west": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=east,direction=north": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=east,direction=south": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=east,direction=east": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=east,direction=west": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=west,direction=north": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 0,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=west,direction=south": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 180,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=west,direction=east": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 270,
          doubleSided: "@doubleSided",
        },
      },
    ],
    "placement=west,direction=west": [
      {
        geometryId: "dve_diagonal_flat_panel_west_east",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
      {
        geometryId: "dve_diagonal_flat_panel_east_west",
        inputs: {
          texture: "@texture",
          textureRotation: 90,
          doubleSided: "@doubleSided",
        },
      },
    ],
  },
};
