import { VoxelPlacingStrategyData } from "./VoxelPlacingStrategy.types";
import { VoxelModelPlacingStrategy } from "./VoxelPlacingStrategy";

export class VoxelPlacingStrategyRegister {
  static _strategies = new Map<string, VoxelModelPlacingStrategy>();

  static register(id: string, data: VoxelPlacingStrategyData[] | string) {
    this._strategies.set(id, new VoxelModelPlacingStrategy(data));
  }

  static get(id: string) {
    const strategy = this._strategies.get(id);
    if (!strategy) return null;

    return strategy;
  }
}
