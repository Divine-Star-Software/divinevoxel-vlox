import { InitTasks } from "./InitTasks";

export class VoxelBuildSpaceWorld {
  private static BuildTaskInit = false;

  constructor() {
    if (!VoxelBuildSpaceWorld.BuildTaskInit) {
      InitTasks();
      VoxelBuildSpaceWorld.BuildTaskInit = true;
    }
  }
}
