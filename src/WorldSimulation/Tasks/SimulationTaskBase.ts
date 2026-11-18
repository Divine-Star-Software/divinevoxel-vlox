import { LocationData } from "../../Math/index.js";
import { WorldSimulationDimensions } from "../Internal/WorldSimulationDimensions.js";
import { DimensionSegment } from "../Dimensions/DimensionSegment.js";
import { TaskSegment } from "./TaskSegment.js";
import { SimulationSector } from "WorldSimulation/Dimensions/SimulationSector.js";
import { PerfLog } from "../../Util/PerfLog.js";

export type SimulationTaskBaseData = {
  id: string;
  sort?: boolean;
  generationTask?: boolean;
  checkInRequired?: boolean;
  /**
   * Defaults to true. When false the task runs even if its sector is no
   * longer in the dimension's active sectors (e.g. unloading), and `sector`
   * is passed as null.
   */
  requiresActiveSector?: boolean;
  log?: boolean;
  checkDone?(location: LocationData): boolean;
  run(
    dimension: DimensionSegment,
    location: LocationData,
    taskId: number,
    task: TaskSegment,
    /** Null only for tasks with `requiresActiveSector: false`. */
    sector: SimulationSector,
  ): void;
};

export class SimulationTaskBase {
  _subTask = new Map<string, SimulationTaskBase>();
  constructor(
    public data: SimulationTaskBaseData,
    public parent?: SimulationTaskBase,
  ) {}

  getTotal(dimensionId: number) {
    const dimension = WorldSimulationDimensions.getDimension(dimensionId);
    const task = dimension.getTask(this.data.id);
    return task.nodes.length;
  }

  getTotalWaitingFor(dimensionId: number) {
    const dimension = WorldSimulationDimensions.getDimension(dimensionId);
    const task = dimension.getTask(this.data.id);
    return task.waitingFor;
  }
  add(dimensionId: number, x: number, y: number, z: number) {
    const dimension = WorldSimulationDimensions.getDimension(dimensionId);
    const task = dimension.getTask(this.data.id);

    if (task.has(x, y, z)) return;

    task.add(x, y, z);
  }

  addSubTask(data: SimulationTaskBaseData) {
    this._subTask.set(data.id, new SimulationTaskBase(data, this));
  }

  runTask(max = 10) {
    const id = this.data.id;
    const perfStart = PerfLog.now();
    for (const [key, dimension] of WorldSimulationDimensions._dimensions) {
      const task = dimension.getTask(this.data.id);
      if (this.data.checkDone) {
        for (const [id, taskData] of task._task) {
          if (this.data.checkDone(taskData)) {
            task.completeTask(id);
          }
        }
      }

      PerfLog.gauge(`${id}.queued`, task.nodes.length);
      PerfLog.gauge(`${id}.inFlight`, task.waitingFor);
      if (task.waitingFor >= max) {
        if (task.nodes.length) PerfLog.count(`${id}.fullSkip`);
        continue;
      }

      if (this.data.sort) {
        const updatePosition = dimension.getUpdatePosition();
        task.sort(updatePosition.x, updatePosition.y, updatePosition.z);
      }
      const addBack: number[] = [];
      for (const location of task.run()) {
        const [d, x, y, z] = location;
        const sector = dimension.activeSectors.get(x, y, z);
        if (!sector && this.data.requiresActiveSector !== false) {
          // The sector left range. Drop the task rather than re-queueing it
          // forever; it is queued again if the sector comes back.
          PerfLog.count(`${id}.noSector`);
          continue;
        }
        // A sector that left range and came back gets a new SimulationSector,
        // which binds `sector` only once all its neighbours are active.
        if (this.data.checkInRequired && sector && !sector.sector) {
          addBack.push(x, y, z);
          continue;
        }
        if (this.data.checkInRequired && !sector?.canCheckOut()) {
          PerfLog.count(`${id}.blockedByCheckOut`);
          addBack.push(x, y, z);
          continue;
        }
        PerfLog.count(`${id}.dispatched`);

        const taskId = task.addTask(x, y, z, this._subTask.size);
        // `location` is pooled and reused once the loop moves on, so async
        // tasks get their own copy.
        const taskLocation: LocationData = [d, x, y, z];
        this.data.run(dimension, taskLocation, taskId, task, sector!);
        if (this._subTask.size) {
          for (const [, subTask] of this._subTask) {
            subTask.data.run(
              dimension,
              taskLocation,
              taskId,
              task,
              sector!,
            );
          }
        }
        if (task.waitingFor > max) break;
      }
      for (let i = 0; i < addBack.length; i += 3) {
        task.add(addBack[i], addBack[i + 1], addBack[i + 2]);
      }
    }
    PerfLog.end(`tick.runTask.${id}`, perfStart);
  }
}
