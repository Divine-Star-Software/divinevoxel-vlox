import { PaintVoxelData } from "../../../Voxels";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";

interface HandToolEvents {}
export class DebugTool extends BuilderToolBase<HandToolEvents> {
  static ToolId = "Debug";

  selection = new VoxelPointSelection();
  voxelData: PaintVoxelData;
  usePlacingStrategy = true;

  async update() {
    this._lastPicked = await this.space.pickWithProvider(this.rayProviderIndex);
    if (!this._lastPicked) return;

    if (!this.space.bounds.intersectsPoint(this._lastPicked.position)) {
      this._lastPicked = null;
      return;
    }
    this.selection.reConstruct(this._lastPicked.position);
  }

  cancel(): void {
    this._lastPicked = null;
  }

  async use() {
    if (!this._lastPicked) return;

    console.warn("USE DEBUG");
    console.log("PICKED", this._lastPicked.clone());
    console.log(
      "VOXEL",
      this._lastPicked.voxel.getStringId(),
      this._lastPicked.voxel.getId(),
      this._lastPicked.voxel.getVoxelId(),
    );
    return;
  }

  getOptionValue(id: string) {
    return null;
  }
  getCurrentOptions(): ToolOptionsData {
    return [];
  }
  updateOption(property: string, value: any): void {}
}
