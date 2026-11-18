import { Threads, BinaryTaskType, Thread } from "@amodx/threads/";
import { WorldDataSyncIds } from "../../../World/Types/WorldDataSyncIds.js";
import { WorldRegister } from "../../../World/WorldRegister.js";
import type { LocationData } from "../../../Math/index.js";
import { DimensionSyncData } from "../../../World/Types/WorldData.types.js";
import { getLocationData } from "../../../Util/LocationData.js";
import { PerfLog } from "../../../Util/PerfLog.js";

let _worldThread: Thread | null = null;
const _checkedIn = new Map<string, LocationData[]>();

export function ReturnCheckedOutSectors(task: LocationData) {
  const key = task.toString();
  const locations = _checkedIn.get(key);
  if (!locations) return;
  _checkedIn.delete(key);
  const start = PerfLog.now();
  const buffers: ArrayBufferLike[] = [];
  for (let i = 0; i < locations.length; i++) {
    const buffer = WorldRegister.sectors.remove(...locations[i]);
    if (!buffer) {
      console.warn("Not buffer returned when checking out sector", locations[i]);
      continue;
    }
    buffers.push(buffer);
  }
  _worldThread!.runTask(
    WorldDataSyncIds.CheckInSectors,
    [task, locations, buffers],
    buffers
  );
  PerfLog.end("sync.returnSectors", start);
}

export default function (worldThread: Thread) {
  _worldThread = worldThread;
  Threads.registerTask<DimensionSyncData>(
    WorldDataSyncIds.SyncDimension,
    (data) => {
      WorldRegister.dimensions.add(data.index, data.id);
    }
  );
  Threads.registerTask<[LocationData]>(
    WorldDataSyncIds.UnSyncDimension,
    (data) => {
      //  register.dimensions.re(data.id);
    }
  );
  Threads.registerTask<[LocationData, ArrayBufferLike]>(
    WorldDataSyncIds.SyncSector,
    (data) => {
      if (WorldRegister.sectors.get(data[0][0], data[0][1], data[0][2], data[0][3]))
        PerfLog.count("sync.syncSectorAlreadyLoaded");
      const start = PerfLog.now();
      WorldRegister.sectors.add(
        data[0][0],
        data[0][1],
        data[0][2],
        data[0][3],
        data[1]
      );
      PerfLog.end("sync.syncSector", start);
    }
  );
  Threads.registerTask<LocationData>(WorldDataSyncIds.UnSyncSector, (data) => {
    WorldRegister.sectors.remove(...data);
  });

  Threads.registerTask<
    [task: LocationData, locations: LocationData[], buffers: ArrayBufferLike[]]
  >(WorldDataSyncIds.CheckInSectors, ([task, locations, buffers]) => {
    const start = PerfLog.now();
    for (let i = 0; i < locations.length; i++) {
      const [d, x, y, z] = locations[i];
      WorldRegister.sectors.add(d, x, y, z, buffers[i]);
    }
    _checkedIn.set(task.toString(), locations);
    PerfLog.end("sync.receiveSectors", start);
  });
}
