import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData } from "../../../Voxels";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
export enum HandToolModes {
  Place = "Place",
  Remove = "Remove",
}
interface HandToolEvents {}
export class HandTool extends BuilderToolBase<HandToolEvents> {
  static ToolId = "Hand";
  static ModeArray: HandToolModes[] = [
    HandToolModes.Place,
    HandToolModes.Remove,
  ];
  mode = HandToolModes.Place;
  selection = new VoxelPointSelection();
  voxelData: PaintVoxelData;
  usePlacingStrategy = true;

  async update() {
    this._lastPicked = await this.space.pickWithProvider(this.rayProviderIndex);
    if (!this._lastPicked) return;
    if (this.mode == HandToolModes.Place) {
      if (!this.space.bounds.intersectsPoint(this._lastPicked.normalPosition)) {
        this._lastPicked = null;
        return;
      }
      this.selection.reConstruct(this._lastPicked.normalPosition);
    }
    if (this.mode == HandToolModes.Remove) {
      if (!this.space.bounds.intersectsPoint(this._lastPicked.position)) {
        this._lastPicked = null;
        return;
      }
      this.selection.reConstruct(this._lastPicked.position);
    }
  }

  async use() {
    if (!this._lastPicked) return;
    if (this.mode == HandToolModes.Place) {
      let voxelData = this.voxelData;
      if (this.usePlacingStrategy) {
        const newData = this.space.getPlaceState(voxelData, this._lastPicked);
        if (newData) voxelData = newData;
      }
      await this.space.paintVoxel(
        [
          this._lastPicked.normalPosition.x,
          this._lastPicked.normalPosition.y,
          this._lastPicked.normalPosition.z,
        ],
        voxelData
      );
      return;
    }
    if (this.mode == HandToolModes.Remove) {
      await this.space.eraseVoxel([
        this._lastPicked.position.x,
        this._lastPicked.position.y,
        this._lastPicked.position.z,
      ]);
      return;
    }
  }

  getOptionValue(id: string) {
    return null;
  }
  getCurrentOptions(): ToolOptionsData {
    return [];
  }
  updateOption(property: string, value: any): void {}
}
