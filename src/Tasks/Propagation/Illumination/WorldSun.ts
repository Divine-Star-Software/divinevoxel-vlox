import {
  CardinalNeighbors3D,
  MooreNeighborhood2D,
} from "../../../Math/CardinalNeighbors.js";
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
import { PerfLog } from "../../../Util/PerfLog.js";
import { SectorCursor } from "../../../World/Cursor/SectorCursor.js";
import { Sector } from "../../../World/Sector/Sector.js";

const queue: number[] = [];
const lightData = new VoxelLightData();

function FillAbove(
  sectorCursor: SectorCursor,
  dimension: number,
  cx: number,
  cy: number,
  cz: number
) {
  const sectorBoundsX = WorldSpaces.sector.bounds.x;
  const sectorBoundsY = WorldSpaces.sector.bounds.y;
  const sectorBoundsZ = WorldSpaces.sector.bounds.z;
  const sectionBoundsY = WorldSpaces.section.bounds.y;
  const maxX = cx + sectorBoundsX;
  const maxY = cy + sectorBoundsY;
  const maxZ = cz + sectorBoundsZ;

  const AmaxY = SectorHeightMap.getAbsolute(dimension, cx, cy, cz);
  const minY = AmaxY - 1 < 0 ? 0 : AmaxY;
  const section = sectorCursor.getSection(cx, minY, cz)!;
  const sectionY = section.getPosition()[1] + sectionBoundsY;

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
  return AmaxY;
}

export function RunWorldSun(tasks: VoxelUpdateTask) {
  const origin = tasks.origin;
  const cx = origin[1];
  const cy = origin[2];
  const cz = origin[3];

  const sectorBoundsX = WorldSpaces.sector.bounds.x;
  const sectorBoundsY = WorldSpaces.sector.bounds.y;
  const sectorBoundsZ = WorldSpaces.sector.bounds.z;
  const sectionBoundsY = WorldSpaces.section.bounds.y;

  let phaseStart = PerfLog.now();
  const RmaxY = SectorHeightMap.getRelative(origin);
  const maxX = cx + sectorBoundsX;
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

  const sunFallOff = VoxelLightData.SunFallOffValue;
  const nDataCursor = tasks.nDataCursor;
  const sDataCursor = tasks.sDataCursor;

  PerfLog.end("sun.heightMap", phaseStart);
  phaseStart = PerfLog.now();
  const AmaxY = FillAbove(sectorCursor, origin[0], cx, cy, cz);
  const minY = AmaxY - 1 < 0 ? 0 : AmaxY;

  for (let i = 1; i < MooreNeighborhood2D.length; i++) {
    const nx = cx + MooreNeighborhood2D[i][0] * sectorBoundsX;
    const nz = cz + MooreNeighborhood2D[i][1] * sectorBoundsZ;
    const neighborCursor = nDataCursor.getSector(nx, cy, nz);
    if (
      !neighborCursor ||
      !neighborCursor._current ||
      neighborCursor._current.getBitFlag(Sector.FlagIds.isWorldSunDone)
    )
      continue;
    FillAbove(neighborCursor, origin[0], nx, cy, nz);
  }

  PerfLog.end("sun.fillAbove", phaseStart);
  phaseStart = PerfLog.now();
  const maxAccumulateY = AmaxY == RmaxY ? RmaxY + 1 : RmaxY;
  PerfLog.count("sun.seedLayers", Math.max(0, maxAccumulateY - minY + 1));
  let queueIndex = 0;
  queue.length = 0;

  for (let iy = minY; iy <= maxAccumulateY; iy++) {
    for (let ix = cx; ix < maxX; ix++) {
      for (let iz = cz; iz < maxZ; iz++) {
        if (
          iy != minY &&
          ix != cx &&
          ix != maxX - 1 &&
          iz != cz &&
          iz != maxZ - 1
        )
          continue;
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

  PerfLog.end("sun.seedScan", phaseStart);
  PerfLog.count("sun.seeds", queue.length / 3);
  phaseStart = PerfLog.now();
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
  PerfLog.end("sun.flood", phaseStart);
  let outside = 0;
  for (let i = 0; i < queue.length; i += 3) {
    const qx = queue[i];
    const qz = queue[i + 2];
    if (qx < cx || qx >= maxX || qz < cz || qz >= maxZ) outside++;
  }
  PerfLog.count("sun.floodNodesOutsideSector", outside);
  PerfLog.count("sun.floodNodes", queue.length / 3);

  queue.length = 0;
}
