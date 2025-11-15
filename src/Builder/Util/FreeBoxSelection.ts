import { VoxelBuildSpace } from "../VoxelBuildSpace";
import { VoxelBoundsSelection } from "../../Templates/Selection/VoxelBoundsSelection";
import { Vector3Like } from "@amodx/math";
import { Axes } from "@amodx/math/Vectors/Axes";
import { FreePointSelection } from "./FreePointSelection";
export class FreeBoxSelection {
  start: Vector3Like;
  selection: VoxelBoundsSelection;
  constructor(public space: VoxelBuildSpace, public point: FreePointSelection) {
    this.start = { ...point.selection.origin };
    this.selection = new VoxelBoundsSelection();
    this.selection.reConstruct(
      this.start,
      Axes.UpReadOnly(),
      this.start,
      Axes.UpReadOnly()
    );
  }

  update() {
    const point = this.point.getPoint();
    if (!point) return;
    this.selection.reConstruct(
      this.start,
      Axes.UpReadOnly(),
      point,
      Axes.UpReadOnly()
    );
  }
}
