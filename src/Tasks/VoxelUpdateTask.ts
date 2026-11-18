import { WorldCursor } from "../World/Cursor/WorldCursor";
import { Vec3Array, Vector3Like } from "@amodx/math";
import { WorldSpaces } from "../World/WorldSpaces";
import { LocationData } from "../Math";
import { WorldRegister } from "../World/WorldRegister";

const NEAR_BITS = 10;
const NEAR_OFFSET = 1 << (NEAR_BITS - 1);
const NEAR_MASK = (1 << NEAR_BITS) - 1;
const FAR_OFFSET = 1 << 16;
const FAR_WIDTH = 1 << 17;

export class TaskMap {
  private _near = new Set<number>();
  private _far = new Set<number>();
  get size() {
    return this._near.size + this._far.size;
  }
  origin = Vector3Like.Create();
  start(x: number, y: number, z: number) {
    this.clear();
    this.origin.x = x;
    this.origin.y = y;
    this.origin.z = z;
  }
  private _nearKey(dx: number, dy: number, dz: number) {
    dx += NEAR_OFFSET;
    dy += NEAR_OFFSET;
    dz += NEAR_OFFSET;
    if ((dx | dy | dz) & ~NEAR_MASK) return -1;
    return dx | (dz << NEAR_BITS) | (dy << (NEAR_BITS * 2));
  }
  private _farKey(dx: number, dy: number, dz: number) {
    return (
      dx +
      FAR_OFFSET +
      (dz + FAR_OFFSET) * FAR_WIDTH +
      (dy + FAR_OFFSET) * FAR_WIDTH * FAR_WIDTH
    );
  }
  has(x: number, y: number, z: number) {
    const dx = x - this.origin.x;
    const dy = y - this.origin.y;
    const dz = z - this.origin.z;
    const key = this._nearKey(dx, dy, dz);
    if (key > -1) return this._near.has(key);
    return this._far.has(this._farKey(dx, dy, dz));
  }
  add(x: number, y: number, z: number) {
    const dx = x - this.origin.x;
    const dy = y - this.origin.y;
    const dz = z - this.origin.z;
    const key = this._nearKey(dx, dy, dz);
    if (key > -1) this._near.add(key);
    else this._far.add(this._farKey(dx, dy, dz));
  }
  delete(x: number, y: number, z: number) {
    const dx = x - this.origin.x;
    const dy = y - this.origin.y;
    const dz = z - this.origin.z;
    const key = this._nearKey(dx, dy, dz);
    if (key > -1) this._near.delete(key);
    else this._far.delete(this._farKey(dx, dy, dz));
  }
  clear() {
    if (this._near.size) this._near.clear();
    if (this._far.size) this._far.clear();
  }
}

export class VoxelPositionQueue {
  data = new Int32Array(3 * 1024);
  head = 0;
  tail = 0;
  x = 0;
  y = 0;
  z = 0;
  get size() {
    return (this.tail - this.head) / 3;
  }
  isEmpty() {
    return this.head >= this.tail;
  }
  push(x: number, y: number, z: number) {
    if (this.tail + 3 > this.data.length) this._makeRoom();
    const data = this.data;
    const tail = this.tail;
    data[tail] = x;
    data[tail + 1] = y;
    data[tail + 2] = z;
    this.tail = tail + 3;
  }
  next() {
    const head = this.head;
    if (head >= this.tail) {
      this.head = this.tail = 0;
      return false;
    }
    const data = this.data;
    this.x = data[head];
    this.y = data[head + 1];
    this.z = data[head + 2];
    this.head = head + 3;
    return true;
  }
  clear() {
    this.head = 0;
    this.tail = 0;
  }
  private _makeRoom() {
    const used = this.tail - this.head;
    if (this.head >= this.data.length >> 1) {
      this.data.copyWithin(0, this.head, this.tail);
    } else {
      const grown = new Int32Array(this.data.length * 2);
      grown.set(this.data.subarray(this.head, this.tail));
      this.data = grown;
    }
    this.head = 0;
    this.tail = used;
  }
}

const NegativeInfinityVec3 = Vector3Like.Create(
  -Infinity,
  -Infinity,
  -Infinity
);
const InfinityVec3 = Vector3Like.Create(Infinity, Infinity, Infinity);
const tempPosition = Vector3Like.Create();
class UpdatedBounds {
  displayMin = Vector3Like.Clone(InfinityVec3);
  displayMax = Vector3Like.Clone(NegativeInfinityVec3);

  dimension = 0;
  constructor(public _task: VoxelUpdateTask) {}

  start(dimension?: number) {
    this.dimension = dimension || 0;
    Vector3Like.Copy(this.displayMin, InfinityVec3);
    Vector3Like.Copy(this.displayMax, NegativeInfinityVec3);
  }

  updateDisplay(x: number, y: number, z: number) {
    if (x < this.displayMin.x) this.displayMin.x = x;
    if (y < this.displayMin.y) this.displayMin.y = y;
    if (z < this.displayMin.z) this.displayMin.z = z;
    if (x > this.displayMax.x) this.displayMax.x = x;
    if (y > this.displayMax.y) this.displayMax.y = y;
    if (z > this.displayMax.z) this.displayMax.z = z;
  }

  getSections() {
    const minSectionPos = WorldSpaces.section.getPosition(
      this.displayMin.x,
      this.displayMin.y,
      this.displayMin.z,
      tempPosition
    );
    const minX = minSectionPos.x;
    const minY = minSectionPos.y;
    const minZ = minSectionPos.z;
    const maxSectionPos = WorldSpaces.section.getPosition(
      this.displayMax.x,
      this.displayMax.y,
      this.displayMax.z,
      tempPosition
    );
    const maxX = maxSectionPos.x;
    const maxY = maxSectionPos.y;
    const maxZ = maxSectionPos.z;
    const sectionPositions: Vec3Array[] = [];
    for (let x = minX; x <= maxX; x += WorldSpaces.section.bounds.x) {
      for (let y = minY; y <= maxY; y += WorldSpaces.section.bounds.y) {
        for (let z = minZ; z <= maxZ; z += WorldSpaces.section.bounds.z) {
          if (!this._task.nDataCursor.inBounds(x, y, z)) continue;
          sectionPositions.push([x, y, z]);
        }
      }
    }

    return sectionPositions;
  }

  markDisplayDirty() {
    if (
      this.displayMax.x == -Infinity ||
      this.displayMax.y == -Infinity ||
      this.displayMax.z == -Infinity
    )
      return false;
    if (
      this.displayMin.x == Infinity ||
      this.displayMin.y == Infinity ||
      this.displayMin.z == Infinity
    )
      return false;
    const minSectionPos = WorldSpaces.section.getPosition(
      this.displayMin.x - 1,
      this.displayMin.y - 1,
      this.displayMin.z - 1,
      tempPosition
    );
    const minX = minSectionPos.x;
    const minY = minSectionPos.y;
    const minZ = minSectionPos.z;
    const maxSectionPos = WorldSpaces.section.getPosition(
      this.displayMax.x + 1,
      this.displayMax.y + 1,
      this.displayMax.z + 1,
      tempPosition
    );
    const maxX = maxSectionPos.x;
    const maxY = maxSectionPos.y;
    const maxZ = maxSectionPos.z;

    for (let x = minX; x <= maxX; x += WorldSpaces.section.bounds.x) {
      for (let z = minZ; z <= maxZ; z += WorldSpaces.section.bounds.z) {
        for (let y = minY; y <= maxY; y += WorldSpaces.section.bounds.y) {
          if (!WorldSpaces.world.inBounds(x, y, z)) continue;
          const sector = WorldRegister.sectors.get(this.dimension, x, y, z);
          if (!sector) continue;
          const section = sector.getSection(x, y, z);
          if (!section.canRender()) continue;
          section.incrementTick(section._Ticks.displayDirty);
        }
      }
    }
  }
}

export class VoxelUpdateTask {
  flow = new FlowQueues();
  rgb = new LightQueue();
  sun = new LightQueue();
  power = new PowerQueue();

  bounds = new UpdatedBounds(this);
  sDataCursor = new WorldCursor();
  nDataCursor = new WorldCursor();
  origin: LocationData = [0, 0, 0, 0];
  setOrigin(dimension: number, x: number, y: number, z: number) {
    this.sDataCursor.setFocalPoint(dimension, x, y, z);
    this.nDataCursor.setFocalPoint(dimension, x, y, z);

    this.origin[0] = dimension;
    this.origin[1] = x;
    this.origin[2] = y;
    this.origin[3] = z;

    this.rgb.removeMap.start(x, y, z);
    this.sun.removeMap.start(x, y, z);
    this.rgb.updateMap.start(x, y, z);
    this.sun.updateMap.start(x, y, z);
    this.power.removeMap.start(x, y, z);
    this.power.updateMap.start(x, y, z);
    this.flow.update.map.start(x, y, z);
    this.flow.remove.map.start(x, y, z);
    this.flow.remove.noRemoveMap.start(x, y, z);
    this.bounds.start(dimension);
    this.clear();
  }
  setOriginAt(origin: LocationData) {
    this.setOrigin(...origin);
  }
  clear() {
    this.rgb.clear();
    this.sun.clear();
    this.power.clear();
    this.flow.clear();
  }
}

class FlowQueues {
  update = {
    queue: <number[][]>[],
    map: new TaskMap(),
  };
  remove = {
    queue: <number[][]>[],
    map: new TaskMap(),
    noRemoveMap: new TaskMap(),
  };
  clear() {
    this.update.queue.length = 0;
    this.update.map.clear();
    this.remove.queue.length = 0;
    this.remove.map.clear();
    this.remove.noRemoveMap.clear();
  }
}

class LightQueue {
  update = new VoxelPositionQueue();
  remove = new VoxelPositionQueue();
  removeMap = new TaskMap();
  updateMap = new TaskMap();

  clear() {
    this.update.clear();
    this.remove.clear();
    this.removeMap.clear();
    this.updateMap.clear();
  }
}

class PowerQueue {
  update = new VoxelPositionQueue();
  remove = new VoxelPositionQueue();
  removeMap = new TaskMap();
  updateMap = new TaskMap();

  clear() {
    this.update.clear();
    this.remove.clear();
    this.removeMap.clear();
    this.updateMap.clear();
  }
}
