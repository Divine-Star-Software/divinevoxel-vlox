import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData } from "../../../Voxels";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { BuilderToolBase } from "../BuilderToolBase";
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

  constructor(public space: VoxelBuildSpace) {
    super();
  }

  updatePlacer(picked: VoxelPickResult) {
    if (this.mode == HandToolModes.Place) {
      this.selection.reConstruct(picked.normalPosition);
    }
    if (this.mode == HandToolModes.Remove) {
      this.selection.reConstruct(picked.position);
    }
  }

  async use(
    picked: VoxelPickResult,
    voxelData: PaintVoxelData,
    usePlacingStrategy = true
  ) {
    if (this.mode == HandToolModes.Place) {
      if (!this.space.bounds.intersectsPoint(picked.normalPosition))
        return false;
      if (usePlacingStrategy) {
        const newData = this.space.getPlaceState(voxelData, picked);
        if (newData) voxelData = newData;
      }
      await this.space.paintVoxel(
        [
          picked.normalPosition.x,
          picked.normalPosition.y,
          picked.normalPosition.z,
        ],
        voxelData
      );
      return true;
    }
    if (this.mode == HandToolModes.Remove) {
      if (!this.space.bounds.intersectsPoint(picked.position)) return false;
      await this.space.eraseVoxel([
        picked.position.x,
        picked.position.y,
        picked.position.z,
      ]);
      return true;
    }
  }
}
