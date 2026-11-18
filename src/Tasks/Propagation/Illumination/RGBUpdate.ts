import { VoxelUpdateTask } from "../../VoxelUpdateTask";
import {
  getMinusOneForRGB,
  isGreaterOrEqualThanForRGBRemove,
  isLessThanForRGBAdd,
  isLessThanForRGBRemove,
  removeRGBLight,
} from "./CommonFunctions";

export function RGBUpdate(tasks: VoxelUpdateTask) {
  const queue = tasks.rgb.update;
  const sDataCursor = tasks.sDataCursor;
  const nDataCursor = tasks.nDataCursor;
  const bounds = tasks.bounds;


  while (queue.next()) {
    const x = queue.x;
    const y = queue.y;
    const z = queue.z;

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
        if (nl > -1 && isLessThanForRGBAdd(nl, sl)) {
          queue.push(nx, y, z);
          nVoxel.setLight(getMinusOneForRGB(sl, nl));
        }
      }
    }

    nx = x - 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForRGBAdd(nl, sl)) {
          queue.push(nx, y, z);
          nVoxel.setLight(getMinusOneForRGB(sl, nl));
        }
      }
    }

    ny = y + 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForRGBAdd(nl, sl)) {
          queue.push(x, ny, z);
          nVoxel.setLight(getMinusOneForRGB(sl, nl));
        }
      }
    }

    ny = y - 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForRGBAdd(nl, sl)) {
          queue.push(x, ny, z);
          nVoxel.setLight(getMinusOneForRGB(sl, nl));
        }
      }
    }

    nz = z + 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForRGBAdd(nl, sl)) {
          queue.push(x, y, nz);
          nVoxel.setLight(getMinusOneForRGB(sl, nl));
        }
      }
    }

    nz = z - 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        if (nl > -1 && isLessThanForRGBAdd(nl, sl)) {
          queue.push(x, y, nz);
          nVoxel.setLight(getMinusOneForRGB(sl, nl));
        }
      }
    }

    bounds.updateDisplay(x, y, z);
  }

  queue.clear();
}

export function RGBRemove(tasks: VoxelUpdateTask) {
  const remove = tasks.rgb.remove;
  const update = tasks.rgb.update;
  const removeMap = tasks.rgb.removeMap;
  const updateMap = tasks.rgb.updateMap;
  const sDataCursor = tasks.sDataCursor;
  const nDataCursor = tasks.nDataCursor;
  const bounds = tasks.bounds;


  while (remove.next()) {
    const x = remove.x;
    const y = remove.y;
    const z = remove.z;

    if (removeMap.has(x, y, z)) continue;
    removeMap.add(x, y, z);

    const voxel = sDataCursor.getVoxel(x, y, z);
    if (!voxel) continue;
    const sl = voxel.getLight();
    if (sl <= 0) continue;

    let nx: number, ny: number, nz: number, nVoxel, nl: number, n1HasRGB: boolean;

    nx = x + 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        n1HasRGB = nVoxel.hasRGBLight();
        if (n1HasRGB && isLessThanForRGBRemove(nl, sl)) {
          remove.push(nx, y, z);
          if (nVoxel.isLightSource()) {
            update.push(nx, y, z);
          }
        } else if (n1HasRGB && isGreaterOrEqualThanForRGBRemove(nl, sl) && !updateMap.has(nx, y, z)) {
          updateMap.add(nx, y, z);
          update.push(nx, y, z);
        }
      }
    }

    nx = x - 1;
    if (nDataCursor.inBounds(nx, y, z)) {
      nVoxel = nDataCursor.getVoxel(nx, y, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        n1HasRGB = nVoxel.hasRGBLight();
        if (n1HasRGB && isLessThanForRGBRemove(nl, sl)) {
          remove.push(nx, y, z);
          if (nVoxel.isLightSource()) {
            update.push(nx, y, z);
          }
        } else if (n1HasRGB && isGreaterOrEqualThanForRGBRemove(nl, sl) && !updateMap.has(nx, y, z)) {
          updateMap.add(nx, y, z);
          update.push(nx, y, z);
        }
      }
    }

    ny = y + 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        n1HasRGB = nVoxel.hasRGBLight();
        if (n1HasRGB && isLessThanForRGBRemove(nl, sl)) {
          remove.push(x, ny, z);
          if (nVoxel.isLightSource()) {
            update.push(x, ny, z);
          }
        } else if (n1HasRGB && isGreaterOrEqualThanForRGBRemove(nl, sl) && !updateMap.has(x, ny, z)) {
          updateMap.add(x, ny, z);
          update.push(x, ny, z);
        }
      }
    }

    ny = y - 1;
    if (nDataCursor.inBounds(x, ny, z)) {
      nVoxel = nDataCursor.getVoxel(x, ny, z);
      if (nVoxel) {
        nl = nVoxel.getLight();
        n1HasRGB = nVoxel.hasRGBLight();
        if (n1HasRGB && isLessThanForRGBRemove(nl, sl)) {
          remove.push(x, ny, z);
          if (nVoxel.isLightSource()) {
            update.push(x, ny, z);
          }
        } else if (n1HasRGB && isGreaterOrEqualThanForRGBRemove(nl, sl) && !updateMap.has(x, ny, z)) {
          updateMap.add(x, ny, z);
          update.push(x, ny, z);
        }
      }
    }

    nz = z + 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        n1HasRGB = nVoxel.hasRGBLight();
        if (n1HasRGB && isLessThanForRGBRemove(nl, sl)) {
          remove.push(x, y, nz);
          if (nVoxel.isLightSource()) {
            update.push(x, y, nz);
          }
        } else if (n1HasRGB && isGreaterOrEqualThanForRGBRemove(nl, sl) && !updateMap.has(x, y, nz)) {
          updateMap.add(x, y, nz);
          update.push(x, y, nz);
        }
      }
    }

    nz = z - 1;
    if (nDataCursor.inBounds(x, y, nz)) {
      nVoxel = nDataCursor.getVoxel(x, y, nz);
      if (nVoxel) {
        nl = nVoxel.getLight();
        n1HasRGB = nVoxel.hasRGBLight();
        if (n1HasRGB && isLessThanForRGBRemove(nl, sl)) {
          remove.push(x, y, nz);
          if (nVoxel.isLightSource()) {
            update.push(x, y, nz);
          }
        } else if (n1HasRGB && isGreaterOrEqualThanForRGBRemove(nl, sl) && !updateMap.has(x, y, nz)) {
          updateMap.add(x, y, nz);
          update.push(x, y, nz);
        }
      }
    }

    bounds.updateDisplay(x, y, z);
    voxel.setLight(removeRGBLight(sl));
  }

  remove.clear();
  removeMap.clear();
}