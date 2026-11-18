import { Thread, Threads } from "@amodx/threads";
import { WorldRegister } from "../World/WorldRegister";
import { MeshSection } from "./Voxels/MeshSection";
import { TasksIds } from "../Tasks/TasksIds";
import { SetSectionMeshTask } from "./Types/Mesher.types";
import { getLocationData } from "../Util/LocationData";
import { MeshSectionSnapShot } from "./Voxels/MeshSectionSnapShot";
import {
  SectionSnapShot,
  SectionSnapShotTransferData,
} from "../World/SnapShot/SectionSnapShot";
import { PerfLog } from "../Util/PerfLog";

export default function (rendererThread: Thread) {
  Threads.registerBinaryTask(TasksIds.BuildSection, (view) => {
    const transfers: any[] = [];
    const start = PerfLog.now();
    const section = MeshSection(getLocationData(view), transfers);
    PerfLog.end("mesh.sectionShared", start);
    if (!section) {
      PerfLog.count("mesh.emptySection");
      return;
    }
    rendererThread.runTask<SetSectionMeshTask>(
      "set-section",
      section,
      transfers
    );
  });

  const snapShot = new SectionSnapShot();
  Threads.registerTask<SectionSnapShotTransferData>(
    TasksIds.BuildSectionSnapShot,
    (data, origin) => {
      const start = PerfLog.now();
      snapShot.restore(data);
      PerfLog.end("mesh.restoreSnapShot", start);
      const meshStart = PerfLog.now();
      const transfers: any[] = [];
      const section = MeshSectionSnapShot(snapShot, transfers);
      PerfLog.end("mesh.section", meshStart);
      origin.runTask("cache-snap-shot", ...snapShot.transfer());
      if (!section) {
        PerfLog.count("mesh.emptySection");
        return;
      }
      rendererThread.runTask<SetSectionMeshTask>(
        "set-section",
        section,
        transfers
      );
    }
  );
  Threads.registerBinaryTask(TasksIds.BuildSector, (view, origin) => {
    const location = getLocationData(view);
    const sector = WorldRegister.sectors.getAt(location);
    if (!sector) {
      console.warn("Tried building a sector that does not exists.", location);
      return;
    }

    for (let i = 0; i < sector.sections.length; i++) {
      const section = sector.sections[i];
      let [minY, maxY] = section.getMinMax();

      if (Math.abs(minY) == Infinity && Math.abs(maxY) == Infinity) continue;
      const t = performance.now();
      const transfers: any[] = [];

      const sectionMesh = MeshSection(
        [location[0], ...section.getPosition()],
        transfers
      );
      if (!sectionMesh) continue;
      rendererThread.runTask<SetSectionMeshTask>(
        "set-section",
        sectionMesh,
        transfers
      );
    }
  });
}
