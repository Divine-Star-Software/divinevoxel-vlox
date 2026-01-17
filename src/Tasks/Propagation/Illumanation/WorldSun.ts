import { CardinalNeighbors3D } from "../../../Math/CardinalNeighbors.js";
import { WorldSpaces } from "../../../World/WorldSpaces.js";
import { VoxelUpdateTask } from "../../VoxelUpdateTask.js";
import { SectorHeightMap } from "../../../World/Sector/SectorHeightMap.js";
import { VoxelLightData } from "../../../Voxels/Cursor/VoxelLightData.js";
import {
  getMinusOneForSun,
  getSunLightForUnderVoxel,
  isLessThanForSunAddDown,
  isLessThanForSunAdd,
} from "./CommonFunctions.js";

const queue: number[] = [];
const lightData = new VoxelLightData();

export function RunWorldSun(tasks: VoxelUpdateTask) {
  const origin = tasks.origin;
  const cx = origin[1];
  const cy = origin[2];
  const cz = origin[3];

  const sectorBoundsX = WorldSpaces.sector.bounds.x;
  const sectorBoundsY = WorldSpaces.sector.bounds.y;
  const sectorBoundsZ = WorldSpaces.sector.bounds.z;
  const sectionBoundsY = WorldSpaces.section.bounds.y;

  const RmaxY = SectorHeightMap.getRelative(origin);
  const AmaxY = SectorHeightMap.getAbsolute(
    origin[0],
    origin[1],
    origin[2],
    origin[3]
  );
  const maxX = cx + sectorBoundsX;
  const maxY = cy + sectorBoundsY;
  const maxZ = cz + sectorBoundsZ;

  const sectorCursor = tasks.nDataCursor.getSector(
    origin[1],
    origin[2],
    origin[3]
  );
  if (!sectorCursor) {
    console.warn(
      "Could not load sector when running world sun at ",
      origin.toString()
    );
    return;
  }
  const t = performance.now();

  const minY = AmaxY - 1 < 0 ? 0 : AmaxY;
  const section = sectorCursor.getSection(cx, minY, cz)!;
  const sectionY = section.getPosition()[1] + sectionBoundsY;

  const sunFallOff = VoxelLightData.SunFallOffValue;
  const nDataCursor = tasks.nDataCursor;
  const sDataCursor = tasks.sDataCursor;

  for (let iy = minY; iy < sectionY; iy++) {
    for (let ix = cx; ix < maxX; ix++) {
      for (let iz = cz; iz < maxZ; iz++) {
        const voxel = sectorCursor.getVoxel(ix, iy, iz);
        if (!voxel) continue;
        const l = voxel.getLight();
        if (l < 0) continue;
        voxel.setLight(lightData.setS(0xf, l));
      }
    }
  }

  for (let iy = sectionY; iy < maxY; iy += sectionBoundsY) {
    const sec = sectorCursor.getSection(cx, iy, cz)!;
    const light = sec.light;
    const length = light.length;
    for (let i = 0; i < length; i++) {
      light[i] = lightData.setS(0xf, light[i]);
    }
  }

  const maxAcculamteY = AmaxY == RmaxY ? RmaxY + 1 : RmaxY;
  let queueIndex = 0;
  queue.length = 0;

  for (let iy = minY; iy <= maxAcculamteY; iy++) {
    for (let ix = cx; ix < maxX; ix++) {
      for (let iz = cz; iz < maxZ; iz++) {
        const voxel = sectorCursor.getVoxel(ix, iy, iz);
        if (!voxel) continue;
        const l = voxel.getLight();
        if (l < 0 || lightData.getS(l) != 0xf) continue;

        for (let i = 0; i < CardinalNeighbors3D.length; i++) {
          const n = CardinalNeighbors3D[i];
          const nx = ix + n[0];
          const ny = iy + n[1];
          const nz = iz + n[2];

          const nVoxel = nDataCursor.getVoxel(nx, ny, nz);
          if (!nVoxel) continue;
          const nl = nVoxel.getLight();
          if (nl > -1 && lightData.getS(nl) < 0xf) {
            queue.push(ix, iy, iz);
            break;
          }
        }
      }
    }
  }

  while (queueIndex < queue.length) {
    const x = queue[queueIndex++];
    const y = queue[queueIndex++];
    const z = queue[queueIndex++];

    const voxel = sDataCursor.getVoxel(x, y, z);
    if (!voxel) continue;
    const sl = voxel.getLight();
    if (sl < 0) continue;

    let nx: number, ny: number, nz: number, nVoxel, nl: number;

    nx = x + 1;
    nVoxel = nDataCursor.getVoxel(nx, y, z);
    if (nVoxel) {
      nl = nVoxel.getLight();
      if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
        queue.push(nx, y, z);
        nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
      }
    }

    nx = x - 1;
    nVoxel = nDataCursor.getVoxel(nx, y, z);
    if (nVoxel) {
      nl = nVoxel.getLight();
      if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
        queue.push(nx, y, z);
        nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
      }
    }

    nz = z + 1;
    nVoxel = nDataCursor.getVoxel(x, y, nz);
    if (nVoxel) {
      nl = nVoxel.getLight();
      if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
        queue.push(x, y, nz);
        nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
      }
    }

    nz = z - 1;
    nVoxel = nDataCursor.getVoxel(x, y, nz);
    if (nVoxel) {
      nl = nVoxel.getLight();
      if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
        queue.push(x, y, nz);
        nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
      }
    }

    ny = y + 1;
    nVoxel = nDataCursor.getVoxel(x, ny, z);
    if (nVoxel) {
      nl = nVoxel.getLight();
      if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
        queue.push(x, ny, z);
        nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
      }
    }

    ny = y - 1;
    nVoxel = nDataCursor.getVoxel(x, ny, z);
    if (nVoxel) {
      nl = nVoxel.getLight();
      if (nl > -1 && isLessThanForSunAddDown(nl, sl, sunFallOff)) {
        if (nVoxel.isAir()) {
          queue.push(x, ny, z);
          nVoxel.setLight(getSunLightForUnderVoxel(sl, nl, sunFallOff));
        } else if (!nVoxel.isOpaque()) {
          queue.push(x, ny, z);
          nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
        }
      }
    }
  }

  queue.length = 0;
}
