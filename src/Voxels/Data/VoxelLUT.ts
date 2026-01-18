import { StringPalette } from "../../Util/StringPalette";

export type VoxelLUTExport = {
  material: string[];
  materialMap: number[];
  substance: string[];
  substanceMap: number[];
  voxelIds: string[];
  voxelNametoIdMap: [string, string][];
  voxelIdToNameMap: [string, string][];
  models: string[];
  modelsIndex: number[];
  totalStates: ArrayBufferLike;
  totalMods: ArrayBufferLike;
  totalReltionalStates: ArrayBufferLike;
  totalReltionalMods: ArrayBufferLike;
  totalVoxelIds: number;
  totalRelationalVoxelIds: number;
  totalCombinedIds: number;
  modelStateMaps: [number, number][][];
  modelRelationalStateMaps: [number, number][][];
  voxelModMaps: [number, number][][];
  voxelRelationalModMaps: [number, number][][];
  voxelIdToTrueId: ArrayBufferLike;
  voxelIdToState: ArrayBufferLike;
  voxelIdToMod: ArrayBufferLike;
  voxelRecordStartIndex: ArrayBufferLike;
  voxelRecord: ArrayBufferLike;
  relationalVoxelIdToTrueId: ArrayBufferLike;
  relationalVoxelIdToState: ArrayBufferLike;
  relationalVoxelIdToMod: ArrayBufferLike;
  relationalVoxelRecordStartIndex: ArrayBufferLike;
  relationalVoxelRecord: ArrayBufferLike;
  geometryIndex: ArrayBufferLike;
  geometryInputsIndex: ArrayBufferLike;
  conditionalGeometryIndex: [
    geometryId: number,
    modelState: number,
    modelReltionalState: boolean[]
  ][][];
  conditionalGeometryInputIndex: number[][][];
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

  //TOTALS
  //maps true voxel ids to the total number of states
  static totalStates: Uint16Array;
  //maps true voxel ids to the total number of mod states
  static totalMods: Uint16Array;
  //maps true voxel ids to the total number of reltional states
  static totalReltionalStates: Uint16Array;
  //maps true voxel ids to the total number of reltional mod states
  static totalReltionalMods: Uint16Array;
  static totalVoxelIds = 1;
  static totalRelationalVoxelIds = 1;
  /** totalVoxelIds * totalRelationalVoxelIds */
  static totalCombinedIds = 0;

  //MAPS
  /**Maps model ids to their state maps */
  static modelStateMaps: Map<number, number>[] = [];
  /**Maps model ids to their relational state maps */
  static modelRelationalStateMaps: Map<number, number>[] = [];
  /**Maps voxel true ids to their mod maps */
  static voxelModMaps: Map<number, number>[] = [];
  /**Maps voxel true ids to their relational mod maps */
  static voxelRelationalModMaps: Map<number, number>[] = [];

  //VOXELS IDS
  /**Maps voxel id to its true voxel id */
  static voxelIdToTrueId: Uint16Array;
  /**Maps voxel id to its state */
  static voxelIdToState: Uint16Array;
  /**Maps voxel id to its mod */
  static voxelIdToMod: Uint16Array;

  /** Maps a voxels true id to where it starts in the voxel record.*/
  static voxelRecordStartIndex: Uint16Array;
  /** Maps a voxels true id to its state x mod to get the actual final voxel id*/
  static voxelRecord: Uint16Array;

  //RELATIONAL VOXEL IDS
  /**Maps voxel id to its true voxel id */
  static relationalVoxelIdToTrueId: Uint16Array;
  /**Maps voxel id to its state */
  static relationalVoxelIdToState: Uint16Array;
  /**Maps voxel id to its mod */
  static relationalVoxelIdToMod: Uint16Array;

  /** Maps a voxels true id to where it starts in the voxel record.*/
  static relationalVoxelRecordStartIndex: Uint16Array;
  /** Maps a voxels true id to its state x mod to get the actual final voxel id*/
  static relationalVoxelRecord: Uint16Array;

  //GEOMETRY
  //maps [voxel id x reltional voxel id] to the geometry index
  static geometryIndex: Uint16Array;
  //maps [voxel id x reltional voxel id] to the geometry inputs index
  static geometryInputsIndex: Uint16Array;
  //maps model id to its conditional nodes and the needed voxel id and reltional voxel id
  static conditionalGeometryIndex: [
    geometryId: number,
    modelState: number,
    modelReltionalState: boolean[]
  ][][] = [];
  //maps [geometry id x voxel id x reltional voxel id] to the geometry index
  static conditionalGeometryInputIndex: number[][][] = [];

  static getStateIndex(x: number, y: number, boundsX: number) {
    return x + y * boundsX;
  }

  static getVoxelId(
    trueId: number,
    state: number = 0,
    mod: number = 0
  ): number {
    return this.voxelRecord[
      this.voxelRecordStartIndex[trueId] +
        this.getStateIndex(
          this.modelStateMaps[this.modelsIndex[trueId]].get(state)! ?? 0,
          this.voxelModMaps[trueId].get(mod)! ?? 0,
          this.totalStates[trueId]
        )
    ];
  }

  static getVoxelIdFromString(id: string, state: number = 0, mod: number = 0) {
    if (id == "dve_air") return 0;
    return this.getVoxelId(this.voxelIds.getNumberId(id), state, mod);
  }

  static getReltionalVoxelId(
    trueId: number,
    relationalState: number = 0,
    relationalMod: number = 0
  ): number {
    return this.relationalVoxelRecord[
      this.relationalVoxelRecordStartIndex[trueId] +
        this.getStateIndex(
          this.modelRelationalStateMaps[this.modelsIndex[trueId]].get(
            relationalState
          )!,
          this.voxelRelationalModMaps[trueId].get(relationalMod)!,
          this.totalReltionalStates[trueId]
        )
    ];
  }

  static getGeometryIndex(
    voxelId: number = 0,
    relationalId: number = 0
  ): number {
    return this.geometryIndex[
      VoxelLUT.getStateIndex(voxelId, relationalId, VoxelLUT.totalVoxelIds)
    ];
  }

  static getGeometryInputIndex(
    voxelId: number = 0,
    relationalId: number = 0
  ): number {
    return this.geometryInputsIndex[
      VoxelLUT.getStateIndex(voxelId, relationalId, VoxelLUT.totalVoxelIds)
    ];
  }

  static getConditionalGeometryNodes(
    trueVoxelId: number
  ): [
    geometryId: number,
    modelState: number,
    modelReltionalState: boolean[]
  ][] {
    return this.conditionalGeometryIndex[trueVoxelId];
  }

  static getConditionalGeometryInputIndex(
    getIndex: number,
    voxelId: number = 0,
    relationalId: number = 0
  ): number {
    return this.conditionalGeometryInputIndex[getIndex][voxelId][relationalId];
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
      totalStates: this.totalStates.buffer,
      totalMods: this.totalMods.buffer,
      totalReltionalStates: this.totalReltionalStates.buffer,
      totalReltionalMods: this.totalReltionalMods.buffer,
      totalVoxelIds: this.totalVoxelIds,
      totalRelationalVoxelIds: this.totalRelationalVoxelIds,
      totalCombinedIds: this.totalCombinedIds,
      modelStateMaps: this.modelStateMaps.map((m) => [...m]),
      modelRelationalStateMaps: this.modelRelationalStateMaps.map((m) => [
        ...m,
      ]),
      voxelModMaps: this.voxelModMaps.map((m) => [...m]),
      voxelRelationalModMaps: this.voxelRelationalModMaps.map((m) => [...m]),
      voxelIdToTrueId: this.voxelIdToTrueId.buffer,
      voxelIdToState: this.voxelIdToState.buffer,
      voxelIdToMod: this.voxelIdToMod.buffer,
      voxelRecordStartIndex: this.voxelRecordStartIndex.buffer,
      voxelRecord: this.voxelRecord.buffer,
      relationalVoxelIdToTrueId: this.relationalVoxelIdToTrueId.buffer,
      relationalVoxelIdToState: this.relationalVoxelIdToState.buffer,
      relationalVoxelIdToMod: this.relationalVoxelIdToMod.buffer,
      relationalVoxelRecordStartIndex:
        this.relationalVoxelRecordStartIndex.buffer,
      relationalVoxelRecord: this.relationalVoxelRecord.buffer,
      geometryIndex: this.geometryIndex.buffer,
      geometryInputsIndex: this.geometryInputsIndex.buffer,
      conditionalGeometryIndex: this.conditionalGeometryIndex,
      conditionalGeometryInputIndex: this.conditionalGeometryInputIndex,
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
    this.totalStates = new Uint16Array(exported.totalStates);
    this.totalMods = new Uint16Array(exported.totalMods);
    this.totalReltionalStates = new Uint16Array(exported.totalReltionalStates);
    this.totalReltionalMods = new Uint16Array(exported.totalReltionalMods);
    this.totalVoxelIds = exported.totalVoxelIds;
    this.totalRelationalVoxelIds = exported.totalRelationalVoxelIds;
    this.totalCombinedIds = exported.totalCombinedIds;
    this.modelStateMaps = exported.modelStateMaps.map((m) => new Map(m));
    this.modelRelationalStateMaps = exported.modelRelationalStateMaps.map(
      (m) => new Map(m)
    );
    this.voxelModMaps = exported.voxelModMaps.map((m) => new Map(m));
    this.voxelRelationalModMaps = exported.voxelRelationalModMaps.map(
      (m) => new Map(m)
    );
    this.voxelIdToTrueId = new Uint16Array(exported.voxelIdToTrueId);
    this.voxelIdToState = new Uint16Array(exported.voxelIdToState);
    this.voxelIdToMod = new Uint16Array(exported.voxelIdToMod);
    this.voxelRecordStartIndex = new Uint16Array(
      exported.voxelRecordStartIndex
    );
    this.voxelRecord = new Uint16Array(exported.voxelRecord);
    this.relationalVoxelIdToTrueId = new Uint16Array(
      exported.relationalVoxelIdToTrueId
    );
    this.relationalVoxelIdToState = new Uint16Array(
      exported.relationalVoxelIdToState
    );
    this.relationalVoxelIdToMod = new Uint16Array(
      exported.relationalVoxelIdToMod
    );
    this.relationalVoxelRecordStartIndex = new Uint16Array(
      exported.relationalVoxelRecordStartIndex
    );
    this.relationalVoxelRecord = new Uint16Array(
      exported.relationalVoxelRecord
    );
    this.geometryIndex = new Uint16Array(exported.geometryIndex);
    this.geometryInputsIndex = new Uint16Array(exported.geometryInputsIndex);
    this.conditionalGeometryIndex = exported.conditionalGeometryIndex;
    this.conditionalGeometryInputIndex = exported.conditionalGeometryInputIndex;
  }
}
