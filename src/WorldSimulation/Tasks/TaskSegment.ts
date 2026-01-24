import { LocationData } from "../../Math";
import { WorldSpaces } from "../../World/WorldSpaces";
import { DimensionSegment } from "../Dimensions/DimensionSegment";
const pool: LocationData[] = [];

export class TaskSegment {
  _hash = new Set();
  nodes: LocationData[] = [];

  waitingFor = 0;
  clear() {}

  _taskCount = 0;

  _task = new Map<number, LocationData>();

  constructor(
    public dimension: DimensionSegment,
    public generationTask: boolean,
    public log = false,
  ) {}

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
    this._quickSort(sections, 0, sections.length - 1, x, y, z);
    return sections;
  }

  private _quickSort(
    arr: LocationData[],
    low: number,
    high: number,
    sx: number,
    sy: number,
    sz: number,
  ) {
    const stack: number[] = [];
    stack.push(low, high);

    while (stack.length) {
      high = stack.pop()!;
      low = stack.pop()!;

      if (low >= high) continue;

      const pivotIndex = this._partition(arr, low, high, sx, sy, sz);

      // Push smaller partition first to limit stack growth
      if (pivotIndex - low < high - pivotIndex) {
        stack.push(pivotIndex + 1, high);
        stack.push(low, pivotIndex - 1);
      } else {
        stack.push(low, pivotIndex - 1);
        stack.push(pivotIndex + 1, high);
      }
    }
  }

  private _partition(
    arr: LocationData[],
    low: number,
    high: number,
    sx: number,
    sy: number,
    sz: number,
  ): number {
    const pivot = arr[high];
    const pivotDist =
      (pivot[1] - sx) ** 2 + (pivot[2] - sy) ** 2 + (pivot[3] - sz) ** 2;

    let i = low - 1;
    let temp: LocationData;

    for (let j = low; j < high; j++) {
      const dist =
        (arr[j][1] - sx) ** 2 + (arr[j][2] - sy) ** 2 + (arr[j][3] - sz) ** 2;

      if (dist > pivotDist) {
        i++;
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }

    temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    return i + 1;
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
