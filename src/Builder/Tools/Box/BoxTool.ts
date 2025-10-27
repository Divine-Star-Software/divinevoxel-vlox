import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData } from "../../../Voxels";
import { VoxelBoxSelection } from "../../../Templates/Selection/VoxelBoxSelection";
import { Vector3Like } from "@amodx/math";
import { SurfaceBoxSelection } from "../../Util/SurfaceBoxSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
export enum BoxToolModes {
  Fill = "Fill",
  // Extrude = "Extrude",
  Remove = "Remove",
}

interface BoxToolEvents {}

export class BoxTool extends BuilderToolBase<BoxToolEvents> {
  static ToolId = "Box";
  static ModeArray: BoxToolModes[] = [
    BoxToolModes.Fill,
    //BoxToolModes.Extrude,
    BoxToolModes.Remove,
  ];
  mode = BoxToolModes.Fill;
  selection = new VoxelBoxSelection();
  boxSelection: SurfaceBoxSelection;
  voxelData: PaintVoxelData;
  usePlacingStrategy = true;

  constructor(space: VoxelBuildSpace) {
    super(space);
    this.boxSelection = new SurfaceBoxSelection(this.space, this.selection);
  }

  private _started = false;
  isSelectionStarted() {
    return this._started;
  }
  updateOffset(offset: number) {
    this.boxSelection.offset = offset;
    this.boxSelection.update();
  }

  async update(placerMode: "start" | "end" | null = null) {
    const picked = this.isSelectionStarted()
      ? null
      : await this.space.pickWithProvider(this.rayProviderIndex);
    this._lastPicked = picked;
    if (!this._started && !placerMode && picked) {
      if (this.mode == BoxToolModes.Fill) {
        this.selection.reConstruct(
          picked.normalPosition,
          picked.normal,
          Vector3Like.Add(picked.normalPosition, Vector3Like.Create(1, 1, 1)),
          picked.normal
        );
      }
      if (this.mode == BoxToolModes.Remove) {
        this.selection.reConstruct(
          picked.position,
          picked.normal,
          Vector3Like.Add(picked.position, Vector3Like.Create(1, 1, 1)),
          picked.normal
        );
      }
    }
    if (!this._started && placerMode == "start" && picked) {
      this.boxSelection.offset = 0;
      Vector3Like.Copy(this.boxSelection.planeNormal, picked.normal);
      if (this.mode == BoxToolModes.Fill) {
        Vector3Like.Copy(this.boxSelection.planeOrigin, picked.normalPosition);
      }
      if (this.mode == BoxToolModes.Remove) {
        Vector3Like.Copy(this.boxSelection.planeOrigin, picked.position);
      }
      this.boxSelection.update();
      this._started = true;
      return;
    }
    if (this._started && !placerMode && !picked) {
      this.boxSelection.update();
      return;
    }
    if (this._started && placerMode == "end") {
      this.boxSelection.update();
      this._started = false;
    }
  }

  async use() {
    if (this.mode == BoxToolModes.Fill) {
      await this.space.paintTemplate(
        Vector3Like.ToArray(this.selection.origin),
        this.selection
          .toTemplate({
            fillVoxel: this.voxelData,
          })
          .toJSON()
      );
    }

    if (this.mode == BoxToolModes.Remove) {
      await this.space.eraseTemplate(
        Vector3Like.ToArray(this.selection.origin),
        this.selection.toTemplate({}).toJSON()
      );
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
