import { Threads } from "@amodx/threads/";
import { DataSyncData } from "./DataSync.types";
import { EngineSettings } from "../../../Settings/EngineSettings";

//objects
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { VoxelTagsRegister } from "../../../Voxels/Data/VoxelTagsRegister";
import { VoxelLogicRegister } from "../../../Voxels/Logic/VoxelLogicRegister";
import { GeometryLUT } from "../../../Voxels/Data/GeometryLUT";
import { VoxelSchemas } from "../../../Voxels/State/VoxelSchemas";

export default function InitDataSync(props: {
  onSync(data: DataSyncData): void;
}) {
  Threads.registerTask<DataSyncData>("sync-data", (data) => {
    EngineSettings.syncSettings(data.settings);
    VoxelLUT.import(data.luts.voxel);
    GeometryLUT.import(data.luts.geometry);
    VoxelSchemas.import(data.schemas);
    VoxelTagsRegister.VoxelTags = data.tags.tags;
    VoxelTagsRegister.SubstanceTags = data.tags.substanceTags;

    for (const id in data.tags.logic) {
      VoxelLogicRegister.register(id, data.tags.logic[id]);
    }

    props.onSync(data);
  });
}
