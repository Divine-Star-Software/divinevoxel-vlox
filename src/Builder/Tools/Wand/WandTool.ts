import { PaintVoxelData } from "../../../Voxels/Types/PaintVoxelData";
import { VoxelSurfaceSelection } from "../../../Templates/Selection/VoxelSurfaceSelection";
import { VoxelBFSSelection } from "../../../Templates/Selection/VoxelBFSSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
export enum WandToolModes {
  Place = "Place",
  Extrude = "Extrude",
  Remove = "Remove",
}

interface WandToolEvents {}
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
  voxelData: PaintVoxelData;
  usePlacingStrategy = true;

  async update() {
    this._lastPicked = await this.space.pickWithProvider(this.rayProviderIndex);
    if (!this._lastPicked) return;
    if (
      this.mode == WandToolModes.Place ||
      this.mode == WandToolModes.Extrude
    ) {
      if (!this.space.bounds.intersectsPoint(this._lastPicked.normalPosition)) {
        this._lastPicked = null;
        return;
      }
      this.surfaceSelection.fromJSON(
        await this.space.getSurfaceSelection(
          this._lastPicked.position,
          this._lastPicked.normal,
          this.extrusion,
          this.maxCount
        )
      );
    }
    if (this.mode == WandToolModes.Remove) {
      if (!this.space.bounds.intersectsPoint(this._lastPicked.position)) {
        this._lastPicked = null;
        return;
      }
      this.bfsSelection.fromJSON(
        await this.space.getBFSSelection(
          this._lastPicked.position,
          this.maxCount
        )
      );
    }
  }

  async use() {
    console.warn("use", this.mode);
    const picked = this._lastPicked;
    if (!picked) return;
    let voxelData = this.voxelData;
    if (this.mode == WandToolModes.Place) {
      if (!this.space.bounds.intersectsPoint(picked.normalPosition)) return;
      if (this.usePlacingStrategy) {
        const newData = this.space.getPlaceState(voxelData, picked);
        if (newData) voxelData = newData;
      }
      this.surfaceSelection.fromJSON(
        await this.space.getSurfaceSelection(
          picked.position,
          picked.normal,
          this.extrusion,
          this.maxCount
        )
      );
      await this.space.paintTemplate(
        this.surfaceSelection.origin,
        this.surfaceSelection.toTemplate(voxelData).toJSON()
      );
      return;
    }

    if (this.mode == WandToolModes.Extrude) {
      this.surfaceSelection.fromJSON(
        await this.space.getSurfaceSelection(
          picked.position,
          picked.normal,
          this.extrusion,
          this.maxCount
        )
      );
      const template = await this.space.getExtrudedSelectionTemplate(
        this.surfaceSelection.toJSON(),
        picked.normal
      );
      await this.space.paintTemplate(
        this.surfaceSelection.origin,
        template.toJSON()
      );
      return;
    }

    if (this.mode == WandToolModes.Remove) {
      const selection = await this.space.getBFSSelection(
        picked.position,
        this.maxCount
      );
      await this.space.eraseSelection(selection);
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
