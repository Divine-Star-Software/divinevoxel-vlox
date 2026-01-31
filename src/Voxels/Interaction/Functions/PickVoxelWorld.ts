import { Vec3Array, Vector3Like } from "@amodx/math";
import { Sector, WorldCursor } from "../../../World";
import PickVoxel from "./PickVoxel";
import { Axes } from "@amodx/math/Vectors/Axes";
import { WorldSpaces } from "../../../World/WorldSpaces";
import { WorldRegister } from "../../../World/WorldRegister";
import { SectorCursor } from "../../../World/Cursor/SectorCursor";
/**# PickVoxelWorld
 * Will pick the voxel world and make sure each sector is available before picking it.
 *
 * Useful if the engine is not using shared memory.
 */
export default async function PickVoxelWorld(
  cursor: WorldCursor,
  rayStart: Vec3Array,
  rayDirection: Vec3Array,
  rayLength: number,
) {
  let t = 0;
  const d = 4;
  const rayDir = Vector3Like.Create(...rayDirection);
  const rayPosition = Vector3Like.Create();

  const visited = new Set<Sector>();
  const sectorCursor = new SectorCursor();

  while (t < rayLength) {
    rayPosition.x = rayStart[0] + t * rayDir.x;
    rayPosition.y = rayStart[1] + t * rayDir.y;
    rayPosition.z = rayStart[2] + t * rayDir.z;

    t += d;

    const { x, y, z } = WorldSpaces.sector.transformPosition(rayPosition);

    if (!WorldSpaces.world.inBounds(x, y, z)) continue;
    const sector = WorldRegister.sectors.get(cursor.dimension, x, y, z);
    if (!sector) continue;
    if (visited.has(sector)) continue;
    visited.add(sector);
    await sector.waitTillCheckedIn();
    sectorCursor.loadSector(cursor.dimension, x, y, z);
    const result = PickVoxel(sectorCursor, rayStart, rayDirection, rayLength);

    if (result !== null) return result;
  }

  return null;
}
