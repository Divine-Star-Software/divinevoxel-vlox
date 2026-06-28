import { LocationData } from "../../Math/index.js";
import { WorldSimulationDimensions } from "../Internal/WorldSimulationDimensions.js";
import { DimensionSegment } from "../Dimensions/DimensionSegment.js";
import { TaskSegment } from "./TaskSegment.js";
import { SimulationSector } from "WorldSimulation/Dimensions/SimulationSector.js";

export type SimulationTaskBaseData = {
  id: string;
  sort?: boolean;
  generationTask?: boolean;
  checkInRequired?: boolean;
  log?: boolean;
  checkDone?(location: LocationData): boolean;
  run(
    dimension: DimensionSegment,
    location: LocationData,
    taskId: number,
    task: TaskSegment,
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
    for (const [key, dimension] of WorldSimulationDimensions._dimensions) {
      const task = dimension.getTask(this.data.id);
      if (this.data.checkDone) {
        for (const [id, taskData] of task._task) {
          if (this.data.checkDone(taskData)) {
            task.completeTask(id);
          }
        }
      }

      if (task.waitingFor >= max) continue;

      if (this.data.sort) {
        const updatePosition = dimension.getUpdatePosition();
        task.sort(updatePosition.x, updatePosition.y, updatePosition.z);
      }
      const addBack: number[] = [];
      for (const location of task.run()) {
        const [d, x, y, z] = location;
        const sector = dimension.activeSectors.get(x, y, z);
        if (!sector || (this.data.checkInRequired && !sector.canCheckOut())) {
          addBack.push(x, y, z);
          continue;
        }

        const taskId = task.addTask(x, y, z,this._subTask.size);
        this.data.run(dimension, location, taskId, task, sector);
        if (this._subTask.size) {
          for (const [, subTask] of this._subTask) {
            subTask.data.run(dimension, location, taskId, task, sector);
          }
        }
        if (task.waitingFor > max) break;
      }
      for (let i = 0; i < addBack.length; i += 3) {
        task.add(addBack[i], addBack[i + 1], addBack[i + 2]);
      }
    }
  }
}
