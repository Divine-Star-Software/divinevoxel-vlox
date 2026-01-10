import { StringPalette } from "../../Util/StringPalette";

export type VoxelLUTExport = {
  material: string[];
  materialMap: number[];
  substance: string[];
  substanceMap: number[];
  voxelIds: string[];
  voxelNametoIdMap: [key: string, value: string][];
  voxelIdToNameMap: [key: string, value: string][];
  models: string[];
  modelsIndex: number[];
  totalStates: number[];
  totalMods: number[];
  totalReltionalStates: number[];
  totalReltionalMods: number[];
  geomtryIndex: number[][];
  geomtryInputsIndex: number[][];
  conditionalGeomtryIndex: [
    geometryId: number,
    modelState: number,
    modelReltionalState: boolean[]
  ][][];
  conditionalGeomtryInputIndex: number[][][];
  voxels: [voxelId: number, state: number, mod: number][];
  voxelRecord: number[][][];
  voxelIdToModelState: number[];
  reltioanlVoxels: [
    voxelId: number,
    reltionalState: number,
    reltioanlMod: number
  ][];
  reltionalVoxelRecord: number[][][];
};

export class VoxelLUT {
  static material = new StringPalette();
  //maps true voxel ids to their material id
  static materialMap: number[] = [];
  static substance = new StringPalette();
  //maps true voxel ids to their substance id
  static substanceMap: number[] = [];
  //maps voxel string ids to their true id
  static voxelIds = new StringPalette();
  //maps voxel names to their ids
  static voxelNametoIdMap = new Map<string, string>();
  //maps voxel ids to their names
  static voxelIdToNameMap = new Map<string, string>();

  //palette of voxel model ids
  static models = new StringPalette();
  //maps true voxel ids to their model palette id
  static modelsIndex: number[] = [];

  //maps true voxel ids to the total number of states
  static totalStates: number[] = [];
  //maps true voxel ids to the total number of mod states
  static totalMods: number[] = [];
  //maps true voxel ids to the total number of reltional states
  static totalReltionalStates: number[] = [];
  //maps true voxel ids to the total number of reltional mod states
  static totalReltionalMods: number[] = [];

  //maps [voxel id x reltional voxel id] to the geomtry index
  static geomtryIndex: number[][] = [];
  //maps [voxel id x reltional voxel id] to the geomtry inputs index
  static geomtryInputsIndex: number[][] = [];
  //maps voxel id to its conditional nodes and the needed voxel id and reltional voxel id
  static conditionalGeomtryIndex: [
    geometryId: number,
    modelState: number,
    modelReltionalState: boolean[]
  ][][] = [];
  //maps [geomtry id x voxel id x reltional voxel id] to the geomtry index
  static conditionalGeomtryInputIndex: number[][][] = [];

  /**Palette of voxel ids to their tree id, state, and mod value */
  static voxels: [voxelId: number, state: number, mod: number][] = [];
  /**Palette of true voxel ids to state then their mod then the final palette voxel id */
  static voxelRecord: number[][][] = [];
  //Maps the voxel id to the model state
  static voxelIdToModelState: number[] = [];

  /**Palette of voxel ids to their tree id, state, and mod value */
  static reltioanlVoxels: [
    voxelId: number,
    reltionalState: number,
    reltioanlMod: number
  ][] = [];
  /**Palette of true voxel ids to reltional state then theirreltional  mod then the final reltional palette voxel id */
  static reltionalVoxelRecord: number[][][] = [];

  static getVoxelId(id: number, state: number = 0, mod: number = 0): number {
    return this.voxelRecord[id][mod][state];
  }

  static getVoxelIdFromString(id: string, state: number = 0, mod: number = 0) {
    return this.voxelRecord[this.voxelIds.getNumberId(id)][mod][state];
  }

  static getVoxelIdFromName(name: string, state: number = 0, mod: number = 0) {
    return this.voxelRecord[
      this.voxelIds.getNumberId(this.voxelNametoIdMap.get(name)!)
    ][mod][state];
  }

  static getReltionalVoxelId(
    id: number,
    reltioanlState: number = 0,
    reltioanlMod: number = 0
  ): number {
    return this.reltionalVoxelRecord[id][reltioanlMod][reltioanlState];
  }

  static getGeomtryIndex(voxelId: number = 0, reltioanlId: number = 0): number {
    return this.geomtryIndex[voxelId][reltioanlId];
  }

  static getGeomtryInputIndex(
    voxelId: number = 0,
    reltioanlId: number = 0
  ): number {
    return this.geomtryInputsIndex[voxelId][reltioanlId];
  }

  static getConditionalGeomtryNodes(
    trueVoxelId: number
  ): [
    geometryId: number,
    modelState: number,
    modelReltionalState: boolean[]
  ][] {
    return this.conditionalGeomtryIndex[trueVoxelId];
  }

  static getConditionalGeomtryInputIndex(
    getIndex: number,
    voxelId: number = 0,
    reltioanlId: number = 0
  ): number {
    return this.conditionalGeomtryInputIndex[getIndex][voxelId][reltioanlId];
  }

  static export(): VoxelLUTExport {
    return {
      material: this.material._palette,
      materialMap: this.materialMap,
      substance: this.substance._palette,
      substanceMap: this.substanceMap,
      voxelIds: this.voxelIds._palette,
      voxelNametoIdMap: [...this.voxelNametoIdMap],
      voxelIdToNameMap: [...this.voxelIdToNameMap],
      models: this.models._palette,
      modelsIndex: this.modelsIndex,
      totalStates: this.totalStates,
      totalMods: this.totalMods,
      totalReltionalStates: this.totalReltionalStates,
      totalReltionalMods: this.totalReltionalMods,
      geomtryIndex: this.geomtryIndex,
      geomtryInputsIndex: this.geomtryInputsIndex,
      conditionalGeomtryIndex: this.conditionalGeomtryIndex,
      conditionalGeomtryInputIndex: this.conditionalGeomtryInputIndex,
      voxels: this.voxels,
      voxelRecord: this.voxelRecord,
      voxelIdToModelState: this.voxelIdToModelState,
      reltioanlVoxels: this.reltioanlVoxels,
      reltionalVoxelRecord: this.reltionalVoxelRecord,
    };
  }

  static import(exported: VoxelLUTExport) {
    this.material.load(exported.material);
    this.materialMap = exported.materialMap;
    this.substance.load(exported.substance);
    this.substanceMap = exported.substanceMap;
    this.voxelIds.load(exported.voxelIds);
    this.voxelNametoIdMap = new Map(exported.voxelNametoIdMap);
    this.voxelIdToNameMap = new Map(exported.voxelIdToNameMap);
    this.models.load(exported.models);
    this.modelsIndex = exported.modelsIndex;
    this.totalStates = exported.totalStates;
    this.totalMods = exported.totalMods;
    this.totalReltionalStates = exported.totalReltionalStates;
    this.totalReltionalMods = exported.totalReltionalMods;
    this.geomtryIndex = exported.geomtryIndex;
    this.geomtryInputsIndex = exported.geomtryInputsIndex;
    this.conditionalGeomtryIndex = exported.conditionalGeomtryIndex;
    this.conditionalGeomtryInputIndex = exported.conditionalGeomtryInputIndex;
    this.voxels = exported.voxels;
    this.voxelRecord = exported.voxelRecord;
    this.voxelIdToModelState = exported.voxelIdToModelState;
    this.reltioanlVoxels = exported.reltioanlVoxels;
    this.reltionalVoxelRecord = exported.reltionalVoxelRecord;
  }
}
