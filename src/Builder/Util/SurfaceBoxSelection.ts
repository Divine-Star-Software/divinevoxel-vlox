import { VoxelBuildSpace } from "../VoxelBuildSpace";
import { VoxelBoundsSelection } from "../../Templates/Selection/VoxelBoundsSelection";
import { Vector3Like } from "@amodx/math";

/**
 * Converts an end voxel position into the exclusive end point VoxelBoundsSelection.reConstruct expects,
 * so the voxel under the cursor is always part of the selection no matter which direction is dragged.
 */
export function GetInclusiveEndPoint(
  start: Vector3Like,
  end: Vector3Like,
  out: Vector3Like = Vector3Like.Create(),
) {
  out.x = end.x >= start.x ? end.x + 1 : end.x;
  out.y = end.y >= start.y ? end.y + 1 : end.y;
  out.z = end.z >= start.z ? end.z + 1 : end.z;
  return out;
}

const planePoint = Vector3Like.Create();
const endPoint = Vector3Like.Create();
export class SurfaceBoxSelection {
  planeOrigin = Vector3Like.Create();
  planeNormal = Vector3Like.Create();
  /**Where the plane sits along the normal relative to planeOrigin.
   * Set it to the picked face so there is no parallax. Defaults to the center of the voxel layer.
   */
  planeOffset = 0.5;
  offset = 0;
  constructor(
    public space: VoxelBuildSpace,
    public selection: VoxelBoundsSelection,
  ) {}

  update() {
    const rayOrigin = this.space.rayProvider.origin;
    const rayDirection = this.space.rayProvider.direction;
    const normal = this.planeNormal;
    const denominator = Vector3Like.Dot(rayDirection, normal);
    //ray is parallel to the plane
    if (Math.abs(denominator) < 1e-6) return;
    planePoint.x = this.planeOrigin.x + this.planeOffset;
    planePoint.y = this.planeOrigin.y + this.planeOffset;
    planePoint.z = this.planeOrigin.z + this.planeOffset;
    const distance =
      Vector3Like.Dot(Vector3Like.Subtract(planePoint, rayOrigin), normal) /
      denominator;
    //plane is behind the ray
    if (!isFinite(distance) || distance < 0) return;

    const intersectionPoint = Vector3Like.FloorInPlace(
      Vector3Like.Add(
        rayOrigin,
        Vector3Like.MultiplyScalar(rayDirection, distance),
      ),
    );
    //The point is on the plane, so flooring the normal axis is ambiguous. Snap it to the layer.
    if (normal.x !== 0) intersectionPoint.x = this.planeOrigin.x;
    if (normal.y !== 0) intersectionPoint.y = this.planeOrigin.y;
    if (normal.z !== 0) intersectionPoint.z = this.planeOrigin.z;

    let offset = this.offset;
    if (normal.x > 0 || normal.y > 0 || normal.z > 0) {
      offset++;
    }
    if (!this.space.bounds.intersectsPoint(intersectionPoint)) return;
    this.selection.reConstruct(
      this.planeOrigin,
      normal,
      GetInclusiveEndPoint(this.planeOrigin, intersectionPoint, endPoint),
      normal,
      offset,
    );
  }
}
