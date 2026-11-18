import { VoxelCursorInterface } from "./VoxelCursor.interface";
import { RawVoxelData } from "../Types/Voxel.types";
import { VoxelLUT } from "../../Voxels/Data/VoxelLUT";
import { VoxelLevelReader } from "./VoxelLevelReader";
import { PaintVoxelData } from "../Types/PaintVoxelData";

export class VoxelCursor extends VoxelCursorInterface {
  static VoxelDataToRaw(
    data: Partial<PaintVoxelData>,
    light = 0
  ): RawVoxelData {
    let stringId = data.id
      ? data.id
      : data.name
        ? VoxelLUT.voxelNameToIdMap.get(data.name)!
        : "dve_air";
    let secondaryStringId = data.id
      ? data.id
      : data.name
        ? VoxelLUT.voxelNameToIdMap.get(data.name)!
        : "dve_air";

    const id =
      (stringId !== "dve_air" &&
        VoxelLUT.getVoxelIdFromString(
          stringId,
          data.state || 0,
          data.mod || 0
        )) ||
      0;
    const secondaryId =
      (secondaryStringId !== "dve_air" &&
        VoxelLUT.getVoxelIdFromString(
          secondaryStringId,
          data.state || 0,
          data.mod || 0
        )) ||
      0;
    let levelData = 0;
    if (data.level !== undefined)
      levelData = VoxelLevelReader.setLevel(levelData, data.level);
    if (data.levelState !== undefined)
      levelData = VoxelLevelReader.setLevelState(levelData, data.levelState);

    return [id, light, levelData, secondaryId];
  }

  ids: number[] = [];
  light: number[] = [];
  level: number[] = [];
  secondary: number[] = [];

  loadIn() {
    this.process();
  }

  updateVoxel(mode: 0 | 1) {}
}
