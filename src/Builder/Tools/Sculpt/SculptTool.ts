import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData } from "../../../Voxels";
import { VoxelBoundsSelection } from "../../../Templates/Selection/VoxelBoundsSelection";
import { Vector3Like } from "@amodx/math";
import { SurfaceBoxSelection } from "../../Util/SurfaceBoxSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
export enum SculptToolModes {
  Fill = "Fill",
  Extrude = "Extrude",
  Remove = "Remove",
}

interface SculptToolEvents {}

export class SculptTool extends BuilderToolBase<SculptToolEvents> {
  static ToolId = "Sculpt";
  static ModeArray: SculptToolModes[] = [
    SculptToolModes.Fill,
    SculptToolModes.Extrude,
    SculptToolModes.Remove,
  ];
  mode = SculptToolModes.Fill;
  selection = new VoxelBoundsSelection();
  boxSelection: SurfaceBoxSelection;
  voxelData: PaintVoxelData;
  usePlacingStrategy = true;

  constructor(space: VoxelBuildSpace) {
    super(space);
    this.boxSelection = new SurfaceBoxSelection(this.space, this.selection);
  }

  cancel() {
    this._started = false;
  }

  private _started = false;
  isSelectionStarted() {
    return this._started;
  }
  updateOffset(offset: number) {
    this.boxSelection.offset = offset;
    this.boxSelection.update();
  }

  _normal: Vector3Like;
  async update(placerMode: "start" | "end" | null = null) {
    const picked = this.isSelectionStarted()
      ? null
      : await this.space.pickWithProvider(this.rayProviderIndex);
    this._lastPicked = picked;
    if (!this._started && !placerMode && picked) {
      if (
        this.mode == SculptToolModes.Fill ||
        this.mode == SculptToolModes.Extrude
      ) {
        if (!this.space.bounds.intersectsPoint(picked.normalPosition)) {
          this._lastPicked = null;
          return;
        }
        this.selection.reConstruct(
          picked.normalPosition,
          picked.normal,
          Vector3Like.Add(picked.normalPosition, Vector3Like.Create(1, 1, 1)),
          picked.normal,
        );
      }
      if (this.mode == SculptToolModes.Remove) {
        if (!this.space.bounds.intersectsPoint(picked.position)) {
          this._lastPicked = null;
          return;
        }
        this.selection.reConstruct(
          picked.position,
          picked.normal,
          Vector3Like.Add(picked.position, Vector3Like.Create(1, 1, 1)),
          picked.normal,
        );
      }
      this._normal = { ...picked.normal };
    }
    if (!this._started && placerMode == "start" && picked) {
      this.boxSelection.offset = 0;
      Vector3Like.Copy(this.boxSelection.planeNormal, picked.normal);
      if (
        this.mode == SculptToolModes.Fill ||
        this.mode == SculptToolModes.Extrude
      ) {
        Vector3Like.Copy(this.boxSelection.planeOrigin, picked.normalPosition);
      }
      if (this.mode == SculptToolModes.Remove) {
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
    if (this.mode == SculptToolModes.Fill) {
      await this.space.paintTemplate(
        Vector3Like.ToArray(this.selection.origin),
        this.selection
          .toTemplate({
            fillVoxel: this.voxelData,
          })
          .toJSON(),
      );
      return;
    }
    if (this.mode == SculptToolModes.Extrude) {
      const template = await this.space.getExtrudedSelectionTemplate(
        this.selection.toJSON(),
        this._normal,
      );
      await this.space.paintTemplate(this.selection.origin, template.toJSON());
      return;
    }
    if (this.mode == SculptToolModes.Remove) {
      await this.space.eraseTemplate(
        Vector3Like.ToArray(this.selection.origin),
        this.selection.toTemplate({}).toJSON(),
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
