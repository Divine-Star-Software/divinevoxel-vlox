import { PaintVoxelData } from "../../../Voxels";
import { Vector3Like } from "@amodx/math";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { FreePointSelection } from "../../Util/FreePointSelection";
import { FreeBoxSelection } from "../../Util/FreeBoxSelection";
export enum ShapeToolModes {
  Fill = "Fill",
  Remove = "Remove",
}

interface BoxToolEvents {}

export class ShapeTool extends BuilderToolBase<BoxToolEvents> {
  static ToolId = "Shape";
  static ModeArray: ShapeToolModes[] = [
    ShapeToolModes.Fill,
    ShapeToolModes.Remove,
  ];
  mode = ShapeToolModes.Fill;
  selection = new VoxelPointSelection();
  pointSelection = new FreePointSelection(this.space, this.selection);

  boxSelection: FreeBoxSelection | null = null;
  voxelData: PaintVoxelData;
  usePlacingStrategy = true;

  get distance() {
    return this.pointSelection.distance;
  }

  set distance(distance: number) {
    if (this.boxSelection) this.pointSelection.distance = distance;
  }

  private _started = false;
  isSelectionStarted() {
    return this._started;
  }

  async update(placerMode: "start" | "end" | null = null) {
    if (this.boxSelection) {
      this.boxSelection.update();
    } else {
      this.pointSelection.update();
    }

    if (placerMode == "start") {
      this._started = true;
      this.boxSelection = new FreeBoxSelection(this.space, this.pointSelection);
    }

    if (placerMode == "end") {
      this._started = false;
    }
  }

  async use() {
    if (!this.boxSelection) return;
    if (this.mode == ShapeToolModes.Fill) {
      await this.space.paintTemplate(
        Vector3Like.ToArray(this.boxSelection.selection.origin),
        this.boxSelection.selection
          .toTemplate({
            fillVoxel: this.voxelData,
          })
          .toJSON()
      );
      this.boxSelection = null;
      return;
    }

    if (this.mode == ShapeToolModes.Remove) {
      await this.space.eraseTemplate(
        Vector3Like.ToArray(this.boxSelection.selection.origin),
        this.boxSelection.selection.toTemplate({}).toJSON()
      );
      this.boxSelection = null;
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
