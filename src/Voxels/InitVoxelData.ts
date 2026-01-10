import {
  candlesGeometry1,
  candlesGeometry2,
  candlesGeometry3,
  candlesGeometry4,
  candlesModel,
  carpetGeometry,
  carpetModel,
  chainGeometry,
  chainModel,
  fence,
  fenceEastWest,
  fenceNorthsouth,
  fencePost,
  leverGeometry,
  leverModel,
} from "./Models/Defaults/Examples";
import {
  cube,
  halfDownCube,
  eighthCube,
  quaterCubeSouthNorth,
  quaterCubeUpDown,
  quaterCubeWestEast,
  halfSouthCube,
  halfWestCube,
} from "./Models/Defaults/CubeVoxelGeometry";
import {
  orientedCube,
  pillarCube,
  simpleCube,
  simpleNoCulledCube,
  simpleHalfCube,
  simpleTransparentCube,
} from "./Models/Defaults/CubeVoxelModels";
import {
  diagonalFlatPanelEastWest,
  diagonalFlatPanelWestEast,
  thinPanel,
} from "./Models/Defaults/PanelVoxelGeometry";
import { stair } from "./Models/Defaults/StairVoxelModel";
import {
  liquidGeometry,
  liquidModel,
} from "./Models/Defaults/LiquidVoxelModel";
import { VoxelModelData } from "./Models/VoxelModel.types";
import { VoxelGeometryData } from "./Geomtry/VoxelGeomtry.types";
import { VoxelData } from "./Types/Voxel.types";
import {
  simpleCrossedPannel,
  simpleThinPannel,
  simpleTransparentThinPannel,
} from "./Models/Defaults/PanelVoxelModels";
import { VoxelIndex } from "../Voxels/Indexes/VoxelIndex";
import { CacheManager } from "../Cache/CacheManager";
import { VoxelLightData } from "./Cursor/VoxelLightData";
import { VoxelMaterialData } from "./Types/VoxelMaterial.types";
import { VoxelSubstanceData } from "./Types/VoxelSubstances.types";
import { VoxelTagIds } from "./Data/VoxelTag.types";
import { BuildTagAndPaletteData as BuildTagData } from "./Functions/BuildTagData";
import { VoxelLogicRegister } from "./Logic/VoxelLogicRegister";
import { farmGeomtry, farmModels } from "./Models/Defaults/FarmVoxelModels";

import { BuildLUT } from "./Functions/BuildLIT";
import { CompiledvVxelTags } from "./Types/VoxelModelCompiledData.types";

export type InitVoxelDataProps = {
  geometry?: VoxelGeometryData[];
  models?: VoxelModelData[];
  voxels: VoxelData[];
  materials?: VoxelMaterialData[];
  substances?: VoxelSubstanceData[];
};

const geomtry = [
  cube,
  halfDownCube,
  halfSouthCube,
  halfWestCube,
  quaterCubeSouthNorth,
  quaterCubeUpDown,
  quaterCubeWestEast,
  eighthCube,

  thinPanel,

  diagonalFlatPanelEastWest,
  diagonalFlatPanelWestEast,

  fencePost,
  fenceEastWest,
  fenceNorthsouth,

  chainGeometry,
  carpetGeometry,

  candlesGeometry1,
  candlesGeometry2,
  candlesGeometry3,
  candlesGeometry4,

  liquidGeometry,

  ...leverGeometry,

  ...farmGeomtry,
];

const models = [
  simpleCube,
  simpleTransparentCube,
  simpleNoCulledCube,
  orientedCube,
  simpleHalfCube,
  pillarCube,
  simpleThinPannel,
  simpleTransparentThinPannel,

  stair,
  simpleCrossedPannel,

  chainModel,
  carpetModel,
  candlesModel,
  leverModel,

  fence,

  liquidModel,

  ...farmModels,
];

export function InitVoxelData(data: InitVoxelDataProps): CompiledvVxelTags {
  const lightData = new VoxelLightData();

  const materials: VoxelMaterialData[] = [
    { id: "dve_solid", properties: {} },
    { id: "dve_flora", properties: {} },
    { id: "dve_flora_transparent", properties: {} },
    {
      id: "dve_transparent",
      properties: {
        dve_is_transparent: true,
      },
    },
    { id: "dve_glow", properties: {} },
    {
      id: "dve_liquid",
      properties: {
        dve_is_transparent: true,
      },
    },
    ...(data.materials || []),
  ];

  const substances: VoxelSubstanceData[] = [
    {
      id: "dve_air",
      properties: {
        dve_parent_substance: "dve_air",
        dve_is_solid: false,
        dve_is_liquid: false,
        dve_is_transparent: true,
        dve_flow_rate: 0,
      },
    },
    {
      id: "dve_solid",
      properties: {
        dve_parent_substance: "dve_solid",
        dve_is_solid: true,
        dve_is_liquid: false,
        dve_is_transparent: false,
        dve_flow_rate: 0,
      },
    },
    {
      id: "dve_translucent",
      properties: {
        dve_parent_substance: "dve_solid",
        dve_is_solid: true,
        dve_is_liquid: false,
        dve_is_transparent: true,
        dve_flow_rate: 0,
      },
    },
    {
      id: "dve_transparent",
      properties: {
        dve_parent_substance: "dve_solid",
        dve_is_solid: true,
        dve_is_liquid: false,
        dve_is_transparent: true,
        dve_flow_rate: 0,
      },
    },
    {
      id: "dve_flora",
      properties: {
        dve_parent_substance: "dve_solid",
        dve_is_solid: true,
        dve_is_liquid: false,
        dve_is_transparent: true,
        dve_flow_rate: 0,
        dve_is_wind_affected: true,
      },
    },
    {
      id: "dve_liquid",
      properties: {
        dve_parent_substance: "dve_liquid",
        dve_is_solid: false,
        dve_is_liquid: true,
        dve_is_transparent: true,
        dve_flow_rate: 1,
      },
    },
    {
      id: "dve_magma",
      properties: {
        dve_parent_substance: "dve_liquid",
        dve_is_solid: false,
        dve_is_liquid: true,
        dve_is_transparent: false,
        dve_flow_rate: 3,
      },
    },
    ...(data.substances || []),
  ];

  const voxels: VoxelData[] = [
    {
      id: "dve_air",
      properties: {
        dve_substance: "dve_air",
      },
    },
    ...data.voxels,
  ];

  BuildLUT(materials, substances, voxels, geomtry, models);

  const voxelData = BuildTagData({
    voxels,
    voxelsOverrides: {
      [VoxelTagIds.lightValue]: (value) => {
        const v = <number[]>value;
        let sl = 0;
        sl = lightData.setR(v[0], sl);
        sl = lightData.setG(v[1], sl);
        sl = lightData.setB(v[2], sl);
        return sl;
      },
    },
    substances,
    materials,
  });

  for (const id in voxelData.logic) {
    VoxelLogicRegister.register(id, voxelData.logic[id]);
  }
  new VoxelIndex(data.voxels);

  return voxelData;
}
