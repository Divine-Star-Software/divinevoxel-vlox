import { Distance3D, Vec3Array } from "@amodx/math";
import { LocationData } from "../../Math";
import { WorldSpaces } from "../../World/WorldSpaces";
import { DimensionSegment } from "../Dimensions/DimensionSegment";
import { PerfLog } from "../../Util/PerfLog";
const pool: LocationData[] = [];

const sortPosition: Vec3Array = [0, 0, 0];
const sort = (a: LocationData, b: LocationData) => {
  const ad = Distance3D(
    sortPosition[0],
    sortPosition[1],
    sortPosition[2],
    a[1],
    a[2],
    a[3],
  );
  const bd = Distance3D(
    sortPosition[0],
    sortPosition[1],
    sortPosition[2],
    b[1],
    b[2],
    b[3],
  );
  return bd - ad;
};
export class TaskSegment {
  id = "";
  _startTimes = new Map<number, number>();
  _hash = new Set();
  nodes: LocationData[] = [];

  waitingFor = 0;

  _taskCount = 0;

  _task = new Map<number, LocationData>();
  _subTask = new Map<number, number>();

  constructor(
    public dimension: DimensionSegment,
    public generationTask: boolean,
    public log = false,
  ) {}

  clearAll() {
    this.nodes = [];
    this._hash.clear();
    this._task.clear();
    this._subTask.clear();
    this._mainDone.clear();
    this._startTimes.clear();
  }

  _getLocationData(dimension: number, x: number, y: number, z: number) {
    const location: LocationData = pool.length ? pool.pop()! : [0, 0, 0, 0];
    location[0] = dimension;
    location[1] = x;
    location[2] = y;
    location[3] = z;
    return location;
  }

  /** Tasks whose main run finished while sub tasks were still pending. */
  _mainDone = new Set<number>();

  /**
   * Marks the main run of a task done. The task only completes once every sub
   * task has completed too, so an async main run can't be finished early by a
   * synchronous sub task.
   */
  completeTask(id: number) {
    const subTaskCount = this._subTask.get(id);
    if (subTaskCount !== undefined && subTaskCount > 0) {
      this._mainDone.add(id);
      return false;
    }
    this._mainDone.delete(id);
    this._subTask.delete(id);
    const locationData = this._task.get(id);
    if (!locationData) return false;
    this._hash.delete(
      WorldSpaces.hash.hashXYZ(
        locationData[1],
        locationData[2],
        locationData[3],
      ),
    );
    this._task.delete(id);
    pool.push(locationData);
    this.waitingFor--;
    const start = this._startTimes.get(id);
    if (start !== undefined) {
      PerfLog.end(`${this.id}.roundTrip`, start);
      PerfLog.count(`${this.id}.completed`);
      this._startTimes.delete(id);
    }

    return true;
  }

  completeSubTask(id: number) {
    const subTaskCount = this._subTask.get(id);
    if (subTaskCount === undefined) return false;

    const newSubTaskCount = Math.max(subTaskCount - 1, 0);
    this._subTask.set(id, newSubTaskCount);
    if (newSubTaskCount === 0 && this._mainDone.has(id)) {
      return this.completeTask(id);
    }
    return false;
  }

  addTask(x: number, y: number, z: number, subTaskCount: number) {
    const id = this._taskCount;
    this._hash.add(WorldSpaces.hash.hashXYZ(x, y, z));
    this._task.set(id, this._getLocationData(this.dimension.id, x, y, z));
    this._subTask.set(id, subTaskCount);
    this._taskCount++;
    this.waitingFor++;
    this._startTimes.set(id, PerfLog.now());
    return id;
  }

  has(x: number, y: number, z: number) {
    return this._hash.has(WorldSpaces.hash.hashXYZ(x, y, z));
  }

  add(x: number, y: number, z: number) {
    const key = WorldSpaces.hash.hashXYZ(x, y, z);
    if (this._hash.has(key)) return false;
    this._hash.add(key);
    const location = this._getLocationData(this.dimension.id, x, y, z);
    this.nodes.push(location);
  }

  sort(x: number, y: number, z: number) {
    const sections = this.nodes;
    sortPosition[0] = x;
    sortPosition[1] = y;
    sortPosition[2] = z;
    this.nodes.sort(sort);
    return sections;
  }

  *run(): Generator<LocationData> {
    while (this.nodes.length) {
      const vec = this.nodes.pop()!;
      const key = WorldSpaces.hash.hashXYZ(vec[1], vec[2], vec[3]);
      this._hash.delete(key);
      yield vec;

      pool.push(vec);
    }
  }
}
