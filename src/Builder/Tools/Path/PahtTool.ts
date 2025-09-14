import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData } from "../../../Voxels";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
import { VoxelPath, VoxelPathSegment } from "../../../Templates/Path/VoxelPath";
import { Vector3Like } from "@amodx/math";
export enum PathToolModes {
  PlacePoints = "Place Points",
  MovePoints = "Move Points",
  RemovePoints = "Remove Points",
  FillPath = "Fill Path",
  RemovePath = "Remvoe Path",
}
interface PathToolEvents {}
export class PathTool extends BuilderToolBase<PathToolEvents> {
  static ToolId = "Path";
  static ModeArray: PathToolModes[] = [
    PathToolModes.PlacePoints,
    PathToolModes.MovePoints,
    PathToolModes.RemovePoints,
    PathToolModes.FillPath,
    PathToolModes.RemovePath,
  ];
  mode = PathToolModes.PlacePoints;
  selection = new VoxelPointSelection();
  path = new VoxelPath(VoxelPath.CreateNew({}));
  distance = 10;
  voxelData: PaintVoxelData;
  private _placedSegment = false;
  constructor(public space: VoxelBuildSpace) {
    super();
  }

  setMode(mode: PathToolModes) {
    const lastMode = this.mode;
    this.mode = mode;
    if (lastMode == PathToolModes.PlacePoints && this._placedSegment) {
      this._placedSegment = false;
      if (this.path.lastSegment())
        this.path.removeSegment(this.path.lastSegment()!);
    }
    if (mode == PathToolModes.PlacePoints && this.path.segments.length) {
      const point = this.path.lastSegment()!.getPoint(1);

      this.path.addSegment(
        VoxelPathSegment.CreateNew({
          transient: true,
          start: [...point],
          end: [
            this.selection.origin.x,
            this.selection.origin.y,
            this.selection.origin.z,
          ],
        })
      );
    }
  }

  async update() {
    if (this.mode == PathToolModes.PlacePoints) {
      const rayPosition = Vector3Like.FloorInPlace(
        Vector3Like.Add(
          this.space.rayProvider.origin,
          Vector3Like.MultiplyScalar(
            this.space.rayProvider.direction,
            this.distance
          )
        )
      );

      if (!this.space.bounds.intersectsPoint(rayPosition)) {
        //get point ray intersects with the space bounding box and use that instead
      } else {
        this.selection.reConstruct(rayPosition);
      }

      const last = this.path.lastSegment();
      if (last) {
        last.setPoints(last.start, [
          this.selection.origin.x,
          this.selection.origin.y,
          this.selection.origin.z,
        ]);
      }

      return;
    }
  }

  async use() {
    if (this.mode == PathToolModes.PlacePoints) {
      this._placedSegment = true;
      if (!this.path.totalSegments) {
        this.path.addSegment(
          VoxelPathSegment.CreateNew({
            transient: true,
            start: [
              this.selection.origin.x,
              this.selection.origin.y,
              this.selection.origin.z,
            ],
            end: [
              this.selection.origin.x,
              this.selection.origin.y,
              this.selection.origin.z,
            ],
          })
        );
      } else {
        const lastSegment = this.path.lastSegment()!;
        lastSegment.transient = false;
        this.path.addSegment(
          VoxelPathSegment.CreateNew({
            transient: true,
            start: [...lastSegment.end],
            end: [
              this.selection.origin.x,
              this.selection.origin.y,
              this.selection.origin.z,
            ],
          })
        );
      }
    }

    if (this.mode == PathToolModes.FillPath) {
      for (const segment of this.path.segments) {
        segment.voxel = this.voxelData;
      }
      await this.space.paintPath([0, 0, 0], this.path.toJSON());
      return;
    }

    if (this.mode == PathToolModes.RemovePath) {
      await this.space.erasePath([0, 0, 0], this.path.toJSON());
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
