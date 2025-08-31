import { VoxelPalettesRegister } from "../Data/VoxelPalettesRegister";
import { RawVoxelData } from "./Voxel.types";
import { VoxelLevelReader } from "../Cursor/VoxelLevelReader";
import { SchemaRegister } from "../../Voxels/State/SchemaRegister";

export class PaintVoxelData {
  static Create(data: Partial<PaintVoxelData> = {}) {
    return new PaintVoxelData(
      data.id,
      data.name,
      data.state,
      data.stateString,
      data.mod,
      data.modString,
      data.level,
      data.levelState,
      data.secondaryVoxelId,
      data.secondaryName,
      data.secondaryMod,
      data.secondaryModString,
      data.secondaryState,
      data.secondaryModString
    );
  }

  /**Transforms numeric voxel data into a PaintVoxelData object */
  static FromRaw(data: RawVoxelData, paintData = PaintVoxelData.Create()) {
    const [trueVoxelId, state, mod] = VoxelPalettesRegister.voxels[data[0]];
    paintData.id = VoxelPalettesRegister.voxelIds.getStringId(trueVoxelId);
    paintData.state = state;
    paintData.mod = mod;
    paintData.name =
      VoxelPalettesRegister.voxelIdToNameMap.get(paintData.id) || "";

    if (data[3] !== 0) {
      const [trueVoxelId, state, mod] = VoxelPalettesRegister.voxels[data[3]];
      paintData.secondaryVoxelId =
        VoxelPalettesRegister.voxelIds.getStringId(trueVoxelId);
      paintData.secondaryState = state;
      paintData.secondaryMod = mod;
      paintData.secondaryName =
        VoxelPalettesRegister.voxelIdToNameMap.get(
          paintData.secondaryVoxelId
        ) || "";
    }
    paintData.level = VoxelLevelReader.getLevel(data[2]);
    paintData.levelState = VoxelLevelReader.getLevel(data[2]);
    return paintData;
  }

  /**Transforms the voxel data into numeric voxel data */
  static ToRaw(data: Partial<PaintVoxelData>, light = 0): RawVoxelData {
    let stringId = data.id
      ? data.id
      : data.name
      ? VoxelPalettesRegister.voxelNametoIdMap.get(data.name)!
      : "dve_air";
    let secondaryStringId = data.secondaryName
      ? data.secondaryVoxelId
      : data.secondaryName
      ? VoxelPalettesRegister.voxelNametoIdMap.get(data.secondaryName)!
      : "dve_air";

    let state = data.state || 0;
    let mod = data.mod || 0;
    let secondaryState = data.secondaryState || 0;
    let secondaryMod = data.secondaryMod || 0;
    if (SchemaRegister.hasVoxelSchema(stringId)) {
      const schema = SchemaRegister.getVoxelSchemas(stringId);
      if (data.stateString && data.stateString !== "") {
        state = schema.state.readString(data.stateString);
      }
      if (data.modString && data.modString !== "") {
        mod = schema.mod.readString(data.modString);
      }
    }
    if (secondaryStringId && SchemaRegister.hasVoxelSchema(secondaryStringId)) {
      const schema = SchemaRegister.getVoxelSchemas(secondaryStringId);
      if (data.secondaryStateString && data.secondaryStateString !== "") {
        secondaryState = schema.state.readString(data.secondaryStateString);
      }
      if (data.secondaryModString && data.secondaryModString !== "") {
        secondaryMod = schema.mod.readString(data.secondaryModString);
      }
    }
    const id =
      stringId !== "dve_air"
        ? VoxelPalettesRegister.getVoxelIdFromString(
            stringId,
            state || 0,
            mod || 0
          )
        : 0;
    const secondaryId =
      secondaryStringId !== "dve_air"
        ? secondaryStringId
          ? VoxelPalettesRegister.getVoxelIdFromString(
              secondaryStringId,
              secondaryState || 0,
              secondaryMod || 0
            )
          : 0
        : 0;
    let levleData = 0;
    if (data.level !== undefined)
      levleData = VoxelLevelReader.setLevel(levleData, data.level);
    if (data.levelState !== undefined)
      levleData = VoxelLevelReader.setLevelState(levleData, data.levelState);

    return [id, light, levleData, secondaryId];
  }

  /**Restores the data to the default state of being dve_air */
  static Clear(data: PaintVoxelData) {
    data.id = "dve_air";
    data.name = "";
    data.state = 0;
    data.stateString = "";
    data.mod = 0;
    data.modString = "";
    data.level = 0;
    data.levelState = 0;
    data.secondaryVoxelId = "dve_air";
    data.secondaryName = "";
    data.secondaryMod = 0;
    data.secondaryModString = "";
    data.secondaryState = 0;
    data.secondaryStateString = "";
    return data;
  }

  /**Clears the target data and then copies properties from source to target. */
  static Set(
    target: PaintVoxelData,
    source: Partial<PaintVoxelData>
  ): PaintVoxelData {
    PaintVoxelData.Clear(target);
    if (source.id !== undefined) target.id = source.id;
    if (source.name !== undefined) target.name = source.name;
    if (source.state !== undefined) target.state = source.state;
    if (source.stateString !== undefined)
      target.stateString = source.stateString;
    if (source.mod !== undefined) target.mod = source.mod;
    if (source.modString !== undefined) target.modString = source.modString;
    if (source.level !== undefined) target.level = source.level;
    if (source.levelState !== undefined) target.levelState = source.levelState;
    if (source.secondaryVoxelId !== undefined)
      target.secondaryVoxelId = source.secondaryVoxelId;
    if (source.secondaryName !== undefined)
      target.secondaryName = source.secondaryName;
    if (source.secondaryMod !== undefined)
      target.secondaryMod = source.secondaryMod;
    if (source.secondaryModString !== undefined)
      target.secondaryModString = source.secondaryModString;
    if (source.secondaryState !== undefined)
      target.secondaryState = source.secondaryState;
    if (source.secondaryStateString !== undefined)
      target.secondaryStateString = source.secondaryStateString;
    return target;
  }

  private constructor(
    public id: string = "dve_air",
    public name: string = "",
    public state: number = 0,
    public stateString: string = "",
    public mod: number = 0,
    public modString: string = "",
    public level: number = 0,
    public levelState: number = 0,
    public secondaryVoxelId: string = "dve_air",
    public secondaryName: string = "",
    public secondaryMod: number = 0,
    public secondaryModString: string = "",
    public secondaryState: number = 0,
    public secondaryStateString: string = ""
  ) {}
}
