import { LocationData } from "Math/index.js";
import { EngineSettingsData } from "../../../Settings/EngineSettings.types";
import { VoxelLUTExport } from "../../../Voxels/Data/VoxelLUT";
import { GeometryLUTExport } from "../../../Voxels/Data/GeometryLUT";
import { VoxelSchemasExport } from "../../../Voxels/State/VoxelSchemas";
import { CompiledvVxelTags } from "Voxels/Types/VoxelModelCompiledData.types";
export type DataSyncData = {
  settings: EngineSettingsData;
  threads: {
    nexus: boolean;
  };
  tags: CompiledvVxelTags;
  luts: {
    voxel: VoxelLUTExport;
    geometry: GeometryLUTExport;
  };
  schemas: VoxelSchemasExport;
};
export type WorldDataSync = [location: LocationData, buffer: SharedArrayBuffer];
