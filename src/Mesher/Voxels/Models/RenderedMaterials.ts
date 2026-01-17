import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { VoxelModelBuilder } from "./VoxelModelBuilder";

export class RenderedMaterials {
  static meshersMap = new Map<string, VoxelModelBuilder>();
  static meshers: VoxelModelBuilder[] = [];

  static init() {
    const materials = VoxelLUT.material._palette;
    for (const mat of materials) {
      const index = VoxelLUT.material.getNumberId(mat);
      const newTool = new VoxelModelBuilder(mat, index);
      this.meshersMap.set(mat, newTool);
      this.meshers[index] = newTool;
    }
  }
}
