import { VoxelBuildSpace } from "../VoxelBuildSpace";
import { Vector3Like } from "@amodx/math";
import { VoxelPointSelection } from "../../Templates/Selection/VoxelPointSelection";
export class FreePointSelection {
  planeOrigin = Vector3Like.Create();
  planeNormal = Vector3Like.Create();
  offset = 0;
  constructor(
    public space: VoxelBuildSpace,
    public selection: VoxelPointSelection,
    public distance = 10
  ) {}

  getPoint() {
    let rayPosition = Vector3Like.FloorInPlace(
      Vector3Like.Add(
        this.space.rayProvider.origin,
        Vector3Like.MultiplyScalar(
          this.space.rayProvider.direction,
          this.distance
        )
      )
    );

    if (!this.space.bounds.intersectsPoint(rayPosition)) {
      const rayIntersection = this.space.bounds.rayIntersection(
        this.space.rayProvider.origin,
        this.space.rayProvider.direction,
        this.space.rayProvider.length
      );
      if (!isFinite(rayIntersection)) return;
      if (rayIntersection == 0) {
        const rayIntersectionFromWithin =
          this.space.bounds.rayIntersectionFromWithin(
            this.space.rayProvider.origin,
            this.space.rayProvider.direction,
            this.space.rayProvider.length
          );
        if (!isFinite(rayIntersectionFromWithin)) return;
        rayPosition = Vector3Like.FloorInPlace(
          Vector3Like.Add(
            this.space.rayProvider.origin,
            Vector3Like.MultiplyScalar(
              this.space.rayProvider.direction,
              rayIntersectionFromWithin
            )
          )
        );
      } else {
        rayPosition = Vector3Like.FloorInPlace(
          Vector3Like.Add(
            this.space.rayProvider.origin,
            Vector3Like.MultiplyScalar(
              this.space.rayProvider.direction,
              rayIntersection
            )
          )
        );
      }
    }
    return rayPosition;
  }

  update() {
    const point = this.getPoint();
    if (!point) return false;
    this.selection.reConstruct(point);
    return true;
  }
}
