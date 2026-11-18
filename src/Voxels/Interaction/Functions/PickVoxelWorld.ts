import { Vec3Array, Vector3Like } from "@amodx/math";
import { Sector, WorldCursor } from "../../../World";
import { WorldSpaces } from "../../../World/WorldSpaces";
import { WorldRegister } from "../../../World/WorldRegister";
import { SectorCursor } from "../../../World/Cursor/SectorCursor";
import { VoxelPickResult } from "../VoxelPickResult";
import {
  closestUnitNormal,
  closestVoxelFace,
} from "../../../Math/UtilFunctions";


/**# PickVoxelWorld
 * Picks the voxel world with an exact voxel traversal (DDA) along the ray.
 * Every voxel the ray passes through is checked in order, so the first hit is
 * always the closest one. Sectors are made available (checked in) lazily as the
 * ray enters them.
 *
 * Useful if the engine is not using shared memory.
 */
export default async function PickVoxelWorld(
  cursor: WorldCursor,
  rayStart: Vec3Array,
  rayDirection: Vec3Array,
  rayLength: number,
): Promise<VoxelPickResult | null> {
  let dx = rayDirection[0];
  let dy = rayDirection[1];
  let dz = rayDirection[2];
  const dirLength = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!dirLength || !isFinite(dirLength)) return null;
  dx /= dirLength;
  dy /= dirLength;
  dz /= dirLength;

  const ox = rayStart[0];
  const oy = rayStart[1];
  const oz = rayStart[2];

  let x = Math.floor(ox);
  let y = Math.floor(oy);
  let z = Math.floor(oz);

  const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
  const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
  const stepZ = dz > 0 ? 1 : dz < 0 ? -1 : 0;

  const tDeltaX = stepX !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = stepY !== 0 ? Math.abs(1 / dy) : Infinity;
  const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dz) : Infinity;

  let tMaxX =
    stepX > 0
      ? (x + 1 - ox) * tDeltaX
      : stepX < 0
        ? (ox - x) * tDeltaX
        : Infinity;
  let tMaxY =
    stepY > 0
      ? (y + 1 - oy) * tDeltaY
      : stepY < 0
        ? (oy - y) * tDeltaY
        : Infinity;
  let tMaxZ =
    stepZ > 0
      ? (z + 1 - oz) * tDeltaZ
      : stepZ < 0
        ? (oz - z) * tDeltaZ
        : Infinity;

  //normal of the face the ray entered the current voxel through
  let nx = 0;
  let ny = 0;
  let nz = 0;
  let traveled = 0;

  //cache of the current sector so the register is only hit on sector changes
  let currentSector: Sector | null = null;
  let hasSector = false;
  let csx = NaN;
  let csy = NaN;
  let csz = NaN;

  const dimension = cursor.dimension;
  //local so concurrent picks (which await sector check ins) can not clobber each other
  const sectorCursor = new SectorCursor();
  const sectorPosition = Vector3Like.Create();

  while (traveled <= rayLength) {
    if (WorldSpaces.world.inBounds(x, y, z)) {
      sectorPosition.x = x;
      sectorPosition.y = y;
      sectorPosition.z = z;
      WorldSpaces.sector.transformPosition(sectorPosition);
      if (
        !hasSector ||
        sectorPosition.x !== csx ||
        sectorPosition.y !== csy ||
        sectorPosition.z !== csz
      ) {
        hasSector = true;
        csx = sectorPosition.x;
        csy = sectorPosition.y;
        csz = sectorPosition.z;
        currentSector =
          WorldRegister.sectors.get(dimension, csx, csy, csz) || null;
        if (currentSector) {
          await currentSector.waitTillCheckedIn();
          sectorCursor.setSector(currentSector);
        }
      }

      if (currentSector) {
        const voxel = sectorCursor.getVoxel(x, y, z);
        if (voxel && voxel.isRenderable()) {
          if (nx === 0 && ny === 0 && nz === 0) {
            //The ray started inside a voxel. Use the face facing back towards the ray.
            const back = closestUnitNormal([-dx, -dy, -dz]);
            nx = back[0];
            ny = back[1];
            nz = back[2];
          }
          const rayDir = Vector3Like.Create(dx, dy, dz);
          const position = Vector3Like.Create(x, y, z);
          const normal = Vector3Like.Create(nx, ny, nz);
          const unitRayDirection = Vector3Like.FromArray(
            closestUnitNormal(rayDir),
          );
          return new VoxelPickResult(
            Vector3Like.Create(ox, oy, oz),
            rayDir,
            rayLength,
            voxel.getRaw(),
            position,
            normal,
            traveled,
            Vector3Like.Create(x + nx, y + ny, z + nz),
            unitRayDirection,
            closestVoxelFace(unitRayDirection),
            Vector3Like.Clone(normal),
            closestVoxelFace(normal),
            0,
          );
        }
      }
    }

    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      traveled = tMaxX;
      tMaxX += tDeltaX;
      x += stepX;
      nx = -stepX;
      ny = 0;
      nz = 0;
    } else if (tMaxY < tMaxZ) {
      traveled = tMaxY;
      tMaxY += tDeltaY;
      y += stepY;
      nx = 0;
      ny = -stepY;
      nz = 0;
    } else {
      if (!isFinite(tMaxZ)) break;
      traveled = tMaxZ;
      tMaxZ += tDeltaZ;
      z += stepZ;
      nx = 0;
      ny = 0;
      nz = -stepZ;
    }
  }

  return null;
}
