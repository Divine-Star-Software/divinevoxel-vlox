import { Vector3Like } from "@amodx/math";
import { DimensionSegment } from "../Dimensions/DimensionSegment";
import {
  VoxelTickUpdateRegister,
  VoxelTickUpdate,
} from "../Voxels/Ticks/index";

const tickArrayPool: VoxelTickUpdate[][] = [];

export class TickQueue {
  constructor(public dimension: DimensionSegment) {}
  ticks = new Map<number, VoxelTickUpdate[]>();

  getTotalTicks() {
    const tick = this.dimension.getTick();

    const updates = this.ticks.get(tick);

    if (!updates) return 0;

    return updates.length;
  }

  addTick(data: VoxelTickUpdate, delay = 0) {
    const trueTick = this.dimension.getTick() + 1 + delay;
    if (!this.ticks.get(trueTick)) {
      this.ticks.set(
        trueTick,
        tickArrayPool.length ? tickArrayPool.shift()! : []
      );
    }
    const ticks = this.ticks.get(trueTick)!;
    for (let i = 0; i < ticks.length; i++) {
      if (this.compareTick(data, ticks[i])) {
        return;
      }
    }
    ticks.push(data);
  }

  private compareTick(tick: VoxelTickUpdate, otherTick: VoxelTickUpdate) {
    if (!(tick.type == otherTick.type && Vector3Like.Equals(otherTick, tick)))
      return false;
    if (!tick.data) return true;
    if (typeof tick.data == "number") {
      return tick.data == otherTick.data;
    }
    if (typeof tick.data == "string") {
      return tick.data == otherTick.data;
    }
    return JSON.stringify(tick.data) == JSON.stringify(otherTick.data);
  }

  run() {
    const tick = this.dimension.getTick();

    const updates = this.ticks.get(tick);

    if (!updates) return false;

    while (updates.length) {
      const update = updates.shift()!;
      const type = VoxelTickUpdateRegister.getUpdateType(update.type);
      type.run(this.dimension.simulation, update);
    }

    this.ticks.delete(tick);
    tickArrayPool.push(updates);

    return true;
  }
}
