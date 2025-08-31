import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData } from "../../../Voxels/Types/PaintVoxelData";
import { VoxelSurfaceSelection } from "../../../Templates/Selection/VoxelSurfaceSelection";
import { VoxelBFSSelection } from "../../../Templates/Selection/VoxelBFSSelection";
import { BuilderToolBase } from "../BuilderToolBase";
export enum WandToolModes {
  Place = "Place",
  Extrude = "Extrude",
  Remove = "Remove",
}

interface WandToolEvents {

}
export class WandTool extends BuilderToolBase<WandToolEvents> {
  static ToolId = "Wand";
  static ModeArray: WandToolModes[] = [
    WandToolModes.Place,
    WandToolModes.Extrude,
    WandToolModes.Remove,
  ];
  mode = WandToolModes.Place;
  maxCount = 1000;
  extrusion = 0;
  get selection() {
    if (
      this.mode == WandToolModes.Place ||
      this.mode == WandToolModes.Extrude
    ) {
      return this.surfaceSelection;
    }
    return this.bfsSelection;
  }
  surfaceSelection = new VoxelSurfaceSelection();
  bfsSelection = new VoxelBFSSelection();

  constructor(public space: VoxelBuildSpace) {
    super();
  }

  async updatePlacer(picked: VoxelPickResult) {
    if (
      this.mode == WandToolModes.Place ||
      this.mode == WandToolModes.Extrude
    ) {
      this.surfaceSelection.fromJSON(
        await this.space.getSurfaceSelection(
          picked.position,
          picked.normal,
          this.extrusion,
          this.maxCount
        )
      );
    }
    if (this.mode == WandToolModes.Remove) {
      this.bfsSelection.fromJSON(
        await this.space.getBFSSelection(picked.position, this.maxCount)
      );
    }
  }

  async use(
    picked: VoxelPickResult,
    voxelData: PaintVoxelData,
    usePlacingStrategy = true
  ) {
    if (this.mode == WandToolModes.Place) {
      if (!this.space.bounds.intersectsPoint(picked.normalPosition))
        return false;
      if (usePlacingStrategy) {
        const newData = this.space.getPlaceState(voxelData, picked);
        if (newData) voxelData = newData;
      }
      const template = await this.space.getSurfaceSelectionTemplate(
        picked.position,
        picked.normal,
        this.extrusion,
        this.maxCount,
        voxelData
      );
      await this.space.paintTemplate(template.position, template.toJSON());
      return true;
    }

    if (this.mode == WandToolModes.Extrude) {
      const template = await this.space.getSurfaceSelectionTemplate(
        picked.position,
        picked.normal,
        this.extrusion,
        this.maxCount,
        true
      );
      await this.space.paintTemplate(template.position, template.toJSON());
      return true;
    }

    if (this.mode == WandToolModes.Remove) {
      const template = await this.space.getBFSSelectionTemplate(
        picked.position,
        this.maxCount
      );
      await this.space.eraseTemplate(template.position, template.toJSON());
      return true;
    }
  }
}
