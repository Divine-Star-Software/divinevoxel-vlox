import { DimensionSegment } from "../Dimensions/DimensionSegment";
import {
  VoxelTickUpdateRegister,
  VoxelTickUpdate,
} from "../Voxels/Ticks/index";

const tickArrayPool: VoxelTickUpdate[][] = [];

export class TickQueue {
  constructor(public dimension: DimensionSegment) {}
  ticks = new Map<number, VoxelTickUpdate[]>();
  /**
   * Keys of the updates already scheduled for each tick. Deduping by scanning
   * the tick's array made scheduling O(n) per update, so a big liquid flow
   * (hundreds of updates in one tick) cost O(n^2).
   */
  private keys = new Map<number, Set<string>>();

  getTotalTicks() {
    const tick = this.dimension.getTick();

    const updates = this.ticks.get(tick);

    if (!updates) return 0;

    return updates.length;
  }

  addTick(data: VoxelTickUpdate, delay = 0) {
    const trueTick = this.dimension.getTick() + 1 + delay;
    let ticks = this.ticks.get(trueTick);
    let keys = this.keys.get(trueTick);
    if (!ticks) {
      ticks = tickArrayPool.length ? tickArrayPool.pop()! : [];
      this.ticks.set(trueTick, ticks);
    }
    if (!keys) {
      keys = new Set();
      this.keys.set(trueTick, keys);
    }
    const key = this.getKey(data);
    if (keys.has(key)) return;
    keys.add(key);
    ticks.push(data);
  }

  /** Same identity the old compareTick used: type, position and data. */
  private getKey(tick: VoxelTickUpdate) {
    const data = tick.data;
    const dataKey = !data
      ? ""
      : typeof data == "number" || typeof data == "string"
        ? String(data)
        : JSON.stringify(data);
    return `${tick.type}|${tick.x},${tick.y},${tick.z}|${dataKey}`;
  }

  run() {
    const tick = this.dimension.getTick();

    const updates = this.ticks.get(tick);

    if (!updates) return false;

    // Updates always schedule into later ticks, so this array can't grow
    // while it is being run.
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const type = VoxelTickUpdateRegister.getUpdateType(update.type);
      type.run(this.dimension.simulation, update);
    }

    updates.length = 0;
    this.ticks.delete(tick);
    this.keys.delete(tick);
    tickArrayPool.push(updates);

    return true;
  }
}
