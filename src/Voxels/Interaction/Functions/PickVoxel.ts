import { Vec3Array, Vector3Like } from "@amodx/math";
import { DataCursorInterface } from "../../Cursor/DataCursor.interface";
import { VoxelPickResult } from "../VoxelPickResult";
import {
  closestUnitNormal,
  closestVoxelFace,
} from "../../../Math/UtilFunctions";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

const epsilon = 1e-5;
const bounds = new BoundingBox();
export default function PickVoxel(
  cursor: DataCursorInterface,
  rayStart: Vec3Array,
  rayDirection: Vec3Array,
  rayLength: number
) {
  const rayDir = Vector3Like.Create(...rayDirection);
  const rayOrigin = Vector3Like.Create(...rayStart);
  const offset = cursor.volumePosition
    ? cursor.volumePosition
    : Vector3Like.Create();
  bounds.setMinMax(
    Vector3Like.Add(cursor.volumeBounds.min, offset),
    Vector3Like.Add(cursor.volumeBounds.max, offset)
  );

  const safeDirection = Vector3Like.Create(
    Math.abs(rayDir.x) < epsilon ? epsilon : rayDir.x,
    Math.abs(rayDir.y) < epsilon ? epsilon : rayDir.y,
    Math.abs(rayDir.z) < epsilon ? epsilon : rayDir.z
  );

  const invDir = Vector3Like.Divide(Vector3Like.Create(1, 1, 1), safeDirection);
  const tDelta = Vector3Like.Create(
    Math.abs(invDir.x),
    Math.abs(invDir.y),
    Math.abs(invDir.z)
  );

  const tEnter = bounds.rayIntersection(rayOrigin, safeDirection);
  if (!isFinite(tEnter)) {
    return null;
  }

  let traveled = Math.max(tEnter - 0.5, 0.0);
  const pos = Vector3Like.Add(
    rayOrigin,
    Vector3Like.MultiplyScalar(rayDir, traveled)
  );
  const voxel = Vector3Like.FloorInPlace(Vector3Like.Clone(pos));
  const step = Vector3Like.Create(
    rayDir.x >= 0.0 ? 1 : -1,
    rayDir.y >= 0.0 ? 1 : -1,
    rayDir.z >= 0.0 ? 1 : -1
  );

  const tMax = Vector3Like.Create(
    (rayDir.x >= 0 ? voxel.x + 1 - pos.x : pos.x - voxel.x) * tDelta.x +
      traveled,
    (rayDir.y >= 0 ? voxel.y + 1 - pos.y : pos.y - voxel.y) * tDelta.y +
      traveled,
    (rayDir.z >= 0 ? voxel.z + 1 - pos.z : pos.z - voxel.z) * tDelta.z +
      traveled
  );
  const normal = Vector3Like.Create();
  const maxDist = rayLength;
  while (true) {
    let cursorX = voxel.x;
    let cursorY = voxel.y;
    let cursorZ = voxel.z;

    if (cursor.inBounds(cursorX, cursorY, cursorZ)) {
      const voxel = cursor.getVoxel(cursorX, cursorY, cursorZ);
      if (voxel && voxel.isRenderable()) {
        const urd = Vector3Like.FromArray(closestUnitNormal(rayDir));
        const n = Vector3Like.Clone(normal);
        const pos = Vector3Like.Create(cursorX, cursorY, cursorZ);
        const un = Vector3Like.FromArray(closestUnitNormal(n));
        return new VoxelPickResult(
          rayOrigin,
          rayDir,
          rayLength,
          voxel.getRaw(),
          Vector3Like.Clone(pos),
          n,
          traveled,
          Vector3Like.Add(pos, normal),
          Vector3Like.FromArray(closestUnitNormal(rayDir)),
          closestVoxelFace(urd),
          Vector3Like.FromArray(closestUnitNormal(n)),
          closestVoxelFace(un),
          0
        );
      }
    }

    if (tMax.x < tMax.y && tMax.x < tMax.z) {
      traveled = tMax.x;
      tMax.x += tDelta.x;
      voxel.x += step.x;
      normal.x = -step.x;
      normal.y = 0;
      normal.z = 0;
    } else if (tMax.y < tMax.z) {
      traveled = tMax.y;
      tMax.y += tDelta.y;
      voxel.y += step.y;
      normal.x = 0;
      normal.y = -step.y;
      normal.z = 0;
    } else {
      traveled = tMax.z;
      tMax.z += tDelta.z;
      voxel.z += step.z;
      normal.x = 0;
      normal.y = 0;
      normal.z = -step.z;
    }

    if (traveled - tEnter > maxDist) {
      break;
    }
  }
  return null;
}
