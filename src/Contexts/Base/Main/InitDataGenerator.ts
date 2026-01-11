import { DataSyncData } from "../Remote/DataSync.types";
import { DataGeneratorData } from "./DataGenerator.types";
import { EngineSettings } from "../../../Settings/EngineSettings";
import { InitVoxelData } from "../../../Voxels/InitVoxelData";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { GeometryLUT } from "../../../Voxels/Data/GeometryLUT";
import { VoxelSchemas } from "../../../Voxels/State/VoxelSchemas";

export default function InitDataGenerator(
  data: DataGeneratorData
): DataSyncData {
 const tags=  InitVoxelData(data);
  return {
    settings: EngineSettings.settings,
    threads: data.threads,
    tags,
    luts: {
      voxel: VoxelLUT.export(),
      geometry: GeometryLUT.export(),
    },
    schemas: VoxelSchemas.export(),
  };
}
