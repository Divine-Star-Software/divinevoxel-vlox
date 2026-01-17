import { VoxelLightData } from "../../../Voxels/Cursor/VoxelLightData";
import { VoxelUpdateTask } from "../../VoxelUpdateTask";
import {
  isLessThanForSunAdd,
  getMinusOneForSun,
  isLessThanForSunAddDown,
  getSunLightForUnderVoxel,
  removeSunLight,
  isLessThanForSunRemove,
  isGreaterOrEqualThanForSunRemove,
  sunLightCompareForDownSunRemove,
} from "./CommonFunctions";

export function SunUpdate(tasks: VoxelUpdateTask) {
  const queue = tasks.sun.update;
  const sDataCursor = tasks.sDataCursor;
  const nDataCursor = tasks.nDataCursor;
  const bounds = tasks.bounds;
  const sunFallOff = VoxelLightData.SunFallOffValue;

  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const x = queue[queueIndex++];
    const y = queue[queueIndex++];
    const z = queue[queueIndex++];

    const voxel = sDataCursor.getVoxel(x, y, z);
    if (!voxel) continue;
    const sl = voxel.getLight();
    if (sl <= 0) continue;

    let nx: number, ny: number, nz: number, nVoxel, nl: number;

    nx = x + 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
          queue.push(nx, y, z);
          nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
        }
      }
    }

    nx = x - 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
          queue.push(nx, y, z);
          nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
        }
      }
    }

    nz = z + 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
          queue.push(x, y, nz);
          nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
        }
      }
    }

    nz = z - 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
          queue.push(x, y, nz);
          nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
        }
      }
    }

    ny = y + 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForSunAdd(nl, sl, sunFallOff)) {
          queue.push(x, ny, z);
          nVoxel.setLight(getMinusOneForSun(sl, nl, sunFallOff));
        }
      }
    }

    ny = y - 1;
    if (nDataCursor.inBounds(x, ny, z)) {
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

    bounds.updateDisplay(x, y, z);
  }

  queue.length = 0;
}

export function SunRemove(tasks: VoxelUpdateTask) {
  const remove = tasks.sun.remove;
  const update = tasks.sun.update;
  const removeMap = tasks.sun.removeMap;
  const updateMap = tasks.sun.updateMap;
  const sDataCursor = tasks.sDataCursor;
  const nDataCursor = tasks.nDataCursor;
  const bounds = tasks.bounds;

  let removeIndex = 0;

  while (removeIndex < remove.length) {
    const x = remove[removeIndex++];
    const y = remove[removeIndex++];
    const z = remove[removeIndex++];

    if (removeMap.has(x, y, z)) continue;
    removeMap.add(x, y, z);

    const voxel = sDataCursor.getVoxel(x, y, z);
    if (!voxel) continue;
    const sl = voxel.getLight();
    if (sl <= 0) continue;

    let nx: number, ny: number, nz: number, nVoxel, nl: number;

    nx = x + 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > 0) {
          if (isLessThanForSunRemove(nl, sl)) {
            remove.push(nx, y, z);
          } else if (isGreaterOrEqualThanForSunRemove(nl, sl) && !updateMap.has(nx, y, z)) {
            updateMap.add(nx, y, z);
            update.push(nx, y, z);
          }
        }
      }
    }

    nx = x - 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > 0) {
          if (isLessThanForSunRemove(nl, sl)) {
            remove.push(nx, y, z);
          } else if (isGreaterOrEqualThanForSunRemove(nl, sl) && !updateMap.has(nx, y, z)) {
            updateMap.add(nx, y, z);
            update.push(nx, y, z);
          }
        }
      }
    }

    nz = z + 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > 0) {
          if (isLessThanForSunRemove(nl, sl)) {
            remove.push(x, y, nz);
          } else if (isGreaterOrEqualThanForSunRemove(nl, sl) && !updateMap.has(x, y, nz)) {
            updateMap.add(x, y, nz);
            update.push(x, y, nz);
          }
        }
      }
    }

    nz = z - 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > 0) {
          if (isLessThanForSunRemove(nl, sl)) {
            remove.push(x, y, nz);
          } else if (isGreaterOrEqualThanForSunRemove(nl, sl) && !updateMap.has(x, y, nz)) {
            updateMap.add(x, y, nz);
            update.push(x, y, nz);
          }
        }
      }
    }

    ny = y + 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > 0) {
          if (isLessThanForSunRemove(nl, sl)) {
            remove.push(x, ny, z);
          } else if (isGreaterOrEqualThanForSunRemove(nl, sl) && !updateMap.has(x, ny, z)) {
            updateMap.add(x, ny, z);
            update.push(x, ny, z);
          }
        }
      }
    }

    ny = y - 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > 0) {
          if (sunLightCompareForDownSunRemove(nl, sl)) {
            remove.push(x, ny, z);
          } else if (isGreaterOrEqualThanForSunRemove(nl, sl) && !updateMap.has(x, ny, z)) {
            updateMap.add(x, ny, z);
            update.push(x, ny, z);
          }
        }
      }
    }

    bounds.updateDisplay(x, y, z);
    voxel.setLight(removeSunLight(sl));
  }

  remove.length = 0;
  removeMap.clear();
}