import { Thread, Threads } from "@amodx/threads";
import { WorldGeneration } from "./WorldGeneration";
import { TasksIds } from "../../Tasks/TasksIds";
import { LocationData } from "../../Math";
import { getLocationData } from "../../Util/LocationData";
import { WorldGenRegister } from "./WorldGenRegister";
import { ReturnCheckedOutSectors } from "../../Contexts/Base/Remote/InitWorldDataSync";

function run(view: DataView, mode: "generate" | "decorate") {
  const location = getLocationData(view, [0, 0, 0, 0]);
  return new Promise<void>((resolve) =>
    WorldGeneration.generate(location, mode, () => {
      ReturnCheckedOutSectors(location);
      resolve();
    })
  );
}

export default function (props: { worldThread: Thread }) {
  WorldGenRegister._worldThread = props.worldThread;

  Threads.registerBinaryTask(TasksIds.Generate, (data) =>
    run(data, "generate")
  );
  Threads.registerBinaryTask(TasksIds.Decorate, (data) =>
    run(data, "decorate")
  );
}
