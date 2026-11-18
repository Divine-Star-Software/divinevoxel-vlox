import { VoxelSubstanceTags, VoxelTags } from "../Data/VoxelTag.types";
import { VoxelLogicData } from "../Logic/VoxelLogic.types";

export type CompiledVoxelTags = {
  logic: Record<string, VoxelLogicData[]>;
  tags: VoxelTags[];
  substanceTags: VoxelSubstanceTags[];
};
