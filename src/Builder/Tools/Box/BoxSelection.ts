import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { VoxelBoxSelection } from "../../../Templates/Selection/VoxelBoxSelection";
import { Vector3Like } from "@amodx/math";
export class BoxSelection {
  planeOrigin = Vector3Like.Create();
  planeNormal = Vector3Like.Create();
  offset = 0;
  constructor(
    public space: VoxelBuildSpace,
    public selection: VoxelBoxSelection
  ) {}

  update() {
    const rayOrigin = this.space.rayProvider.origin;
    const rayDirection = this.space.rayProvider.direction;
    console.warn("SPACE",this.space)
    console.warn(
      "UPDATE BOX TOOL",
      [rayOrigin.x, rayOrigin.y, rayOrigin.z],
      [rayDirection.x, rayDirection.y, rayDirection.z]
    );
    const distance =
      Vector3Like.Dot(
        Vector3Like.Subtract(this.planeOrigin, rayOrigin),
        this.planeNormal
      ) / Vector3Like.Dot(rayDirection, this.planeNormal);

    const intersectionPoint = Vector3Like.FloorInPlace(
      Vector3Like.Add(
        rayOrigin,
        Vector3Like.MultiplyScalar(rayDirection, distance)
      )
    );
    let offset = this.offset;
    if (
      this.planeNormal.x > 0 ||
      this.planeNormal.y > 0 ||
      this.planeNormal.z > 0
    ) {
      offset++;
    }
    this.selection.reConstruct(
      this.planeOrigin,
      this.planeNormal,
      intersectionPoint,
      this.planeNormal,
      offset
    );
  }
}
