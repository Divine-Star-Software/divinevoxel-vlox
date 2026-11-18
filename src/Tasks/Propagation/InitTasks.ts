import { Threads } from "@amodx/threads";
import { TasksIds } from "../TasksIds";
import { VoxelUpdateTask } from "../VoxelUpdateTask";
import { RunWorldSun } from "./Illumination/WorldSun";
import { WorldRGB } from "./Illumination/WorldRGB";
import { WorldRegister } from "../../World/WorldRegister";
import { Sector } from "../../World";
import { getLocationData } from "../../Util/LocationData";
import { PerfLog } from "../../Util/PerfLog";
import { ReturnCheckedOutSectors } from "../../Contexts/Base/Remote/InitWorldDataSync";

export default function InitTasks() {
  const task = new VoxelUpdateTask();

  Threads.registerBinaryTask(TasksIds.WorldPropagation, (view) => {
    const start = PerfLog.now();
    const location = getLocationData(view);
    task.setOrigin(...location);
    WorldRGB(task);
    PerfLog.end("gen.propagation.compute", start);
    WorldRegister.sectors
      .get(...location)!
      .setBitFlag(Sector.FlagIds.isWorldPropagationDone, true);
    ReturnCheckedOutSectors(location);
  });

  Threads.registerBinaryTask(TasksIds.WorldSun, (view) => {
    const start = PerfLog.now();
    const location = getLocationData(view);
    task.setOrigin(...location);
    RunWorldSun(task);
    PerfLog.end("gen.sun.compute", start);
    WorldRegister.sectors
      .get(...location)!
      .setBitFlag(Sector.FlagIds.isWorldSunDone, true);
    ReturnCheckedOutSectors(location);
  });
}
