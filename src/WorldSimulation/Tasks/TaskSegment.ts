import { Distance3D, Vec3Array } from "@amodx/math";
import { LocationData } from "../../Math";
import { WorldSpaces } from "../../World/WorldSpaces";
import { DimensionSegment } from "../Dimensions/DimensionSegment";
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
  _hash = new Set();
  nodes: LocationData[] = [];

  waitingFor = 0;

  _taskCount = 0;

  _task = new Map<number, LocationData>();

  constructor(
    public dimension: DimensionSegment,
    public generationTask: boolean,
    public log = false,
  ) {}

  clearAll(){
    this.nodes=[];
    this._task.clear();

  }

  _getLocationData(dimension: number, x: number, y: number, z: number) {
    const location: LocationData = pool.length ? pool.pop()! : [0, 0, 0, 0];
    location[0] = dimension;
    location[1] = x;
    location[2] = y;
    location[3] = z;
    return location;
  }

  completeTask(id: number) {
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

    return true;
  }

  addTask(x: number, y: number, z: number) {
    const id = this._taskCount;
    this._task.set(id, this._getLocationData(this.dimension.id, x, y, z));
    this._taskCount++;
    this.waitingFor++;
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
