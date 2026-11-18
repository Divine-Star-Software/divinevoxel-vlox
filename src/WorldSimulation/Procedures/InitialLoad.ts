import { GeneratorData } from "../Dimensions/Generator";
import { WorldSimulation } from "../WorldSimulation";
import { WorldSimulationDimensions } from "../Internal/WorldSimulationDimensions";
import { WorldSimulationTools } from "../Internal/WorldSimulationTools";
import SaveAllSectors from "./SaveAllSectors";
import { PerfLog } from "../../Util/PerfLog";
/**# InitialLoad
 * ---
 * Load the world without building.
 */
export async function InitialLoad(props: {
  dimension?: number;
  logTasks?: true;
  genData: Partial<GeneratorData>;
  buildOnly?: boolean;
}) {
  const loadStart = PerfLog.now();
  PerfLog.log("InitialLoad started");
  return new Promise((resolve) => {
    WorldSimulation.doBuildUpdate = props.buildOnly || false;

    const generator = WorldSimulation.createGenerator({
      ...props.genData,
      building: false,
      culling: false,
    });
    if (!WorldSimulationDimensions._dimensions.has(generator._dimension)) {
      WorldSimulationDimensions.addDimension(generator._dimension);
    }
    const dimension = WorldSimulationDimensions.getDimension(
      props.dimension || 0,
    );
    let done = false;
    generator._building = props.buildOnly || false;
    WorldSimulation.addGenerator(generator);

    let timeOut: any = null;
    const update = () => {
      if (done) return;

      WorldSimulation.tick(
        props.buildOnly ? false : true,
        props.buildOnly || false,
      );
      timeOut = setTimeout(update, 0);
    };
    update();

    const maxDoneCount = 5;
    const checkInterval = 250;

    let allDoneCount = 0;
    const check = async () => {
      if (props.logTasks) {
        console.log(WorldSimulation.logTasks());
      }
      let allDone = true;
      if (props.buildOnly) {
        const task = dimension.tasks.get("build")!;
        if (task.waitingFor > 0 || task._task.size > 0) {
          allDone = false;
        }
      } else {
        for (const [key, task] of dimension.tasks) {
          if (!task.generationTask) continue;
          if (task.waitingFor > 0 || task._task.size > 0) {
            allDone = false;
            break;
          }
        }
      }

      if (!allDone || allDoneCount < maxDoneCount) {
        if (allDone) allDoneCount++;
        setTimeout(check, checkInterval);
        return;
      }
      done = true;
      PerfLog.log(
        `InitialLoad finished in ${(PerfLog.now() - loadStart).toFixed(0)}ms (sectors: ${dimension.activeSectors._sectors.length})`
      );
      clearTimeout(timeOut);
      WorldSimulation.removeGenerator(generator);

      if (!props.buildOnly) {
        if (WorldSimulationTools.worldStorage) {
          await SaveAllSectors();
        }
      }
      WorldSimulation.doBuildUpdate = true;
      resolve(true);
    };

    check();
  });
}
