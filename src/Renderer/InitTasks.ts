import type { SetSectionMeshTask } from "../Mesher/Types/Mesher.types";
import type { LocationData } from "Math/index.js";
import { Thread, Threads } from "@amodx/threads/";
import { MeshManager } from "./MeshManager";
import { MeshRegister } from "./MeshRegister";
import { EngineSettings } from "../Settings/EngineSettings";
import { getLocationData } from "../Util/LocationData";
import { WorldRegister } from "../World/WorldRegister";
import { PerfLog } from "../Util/PerfLog";

type MeshUpdate =
  | { type: "set"; data: SetSectionMeshTask; origin: Thread }
  | { type: "remove"; location: LocationData };

/*
  Section meshes arrive from the mesher threads in bursts, and applying one
  means creating GPU buffers. Applying a whole burst inside the message
  handlers made the frame where the player crossed into new terrain very
  long. Updates are queued (removals too, so a removal can't overtake an
  earlier update for the same sector) and applied under a per-frame budget.
*/
const queue: MeshUpdate[] = [];
let queueStart = 0;
let scheduled = false;

function applyUpdate(update: MeshUpdate) {
  if (update.type == "remove") {
    MeshManager.removeSector(...update.location);
    return;
  }
  const start = PerfLog.now();
  MeshManager.updateSection(update.data);
  PerfLog.end("render.updateSection", start);
  if (!EngineSettings.settings.rendererSettings.cpuBound) {
    update.origin.sendMessage([], [update.data]);
  }
}

function processQueue() {
  scheduled = false;
  const budget = EngineSettings.settings.rendererSettings.meshUploadBudgetMs;
  const start = PerfLog.now();
  let applied = 0;
  while (queueStart < queue.length) {
    const update = queue[queueStart];
    (queue as any)[queueStart] = undefined;
    queueStart++;
    applyUpdate(update);
    applied++;
    if (budget > 0 && performance.now() - start >= budget) break;
  }
  if (queueStart >= queue.length) {
    queue.length = 0;
    queueStart = 0;
  } else {
    schedule();
  }
  PerfLog.end("render.meshQueueFrame", start);
  PerfLog.gauge("render.meshQueue", queue.length - queueStart);
  PerfLog.count("render.meshesApplied", applied);
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(processQueue);
  } else {
    setTimeout(processQueue, 0);
  }
}

function enqueue(update: MeshUpdate) {
  if (!EngineSettings.settings.rendererSettings.meshUploadBudgetMs) {
    applyUpdate(update);
    return;
  }
  queue.push(update);
  schedule();
}

export default function RendererTasks() {
  Threads.registerTask<SetSectionMeshTask>("set-section", (data, origin) => {
    enqueue({ type: "set", data, origin });
  });
  Threads.registerBinaryTask("remove-sector", (data) => {
    enqueue({ type: "remove", location: [...getLocationData(data)] as LocationData });
  });
  Threads.registerTask<LocationData>("clear-all", (data) => {
    // Queued meshes belong to the world being cleared.
    queue.length = 0;
    queueStart = 0;
    MeshRegister.clearAll();
    WorldRegister.clearAll();
  });
}
