import { DataCursorInterface } from "../../../Voxels/Cursor/DataCursor.interface";
import { Vec3Array, Vector3Like } from "@amodx/math";
import { VoxelCursor } from "../../../Voxels/Cursor/VoxelCursor";
import { VoxelSchemas } from "../../../Voxels/State/VoxelSchemas";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
export class VoxelGeometryBuilderCacheSpace {
  foundHash: Uint8Array;
  lightCache: Int32Array;
  //cache of the voxel ids
  private voxelCache: Uint16Array;
  //cache of the true voxel ids
  private trueVoxelCache: Uint16Array;
  //cache of the relational voxel ids
  private relationalVoxelCache: Uint16Array;
  //cache of the relational state
  private relationalStateCache: Uint16Array;

  //cache of the secondary voxel ids
  secondaryVoxelCache: Uint16Array;
  //cache of the true secondary voxel ids
  secondaryTrueVoxelCache: Uint16Array;
  //cache of the relational secondary voxel ids
  secondaryRelationalVoxelCache: Uint16Array;
  //cache of the secondary relational state
  secondaryRelationalStateCache: Uint16Array;

  hasSecondary: Uint8Array;
  noCastAO: Uint8Array;
  secondaryNoCastAO: Uint8Array;
  fullBlock: Uint8Array;
  offset: Vec3Array = [0, 0, 0];
  private _offsetX = 0;
  private _offsetY = 0;
  private _offsetZ = 0;
  private _boundsX = 0;
  private _boundsZ = 0;

  voxelCursor = new VoxelCursor();

  constructor(public bounds: Vector3Like) {
    const volume = bounds.x * bounds.y * bounds.z;
    this._boundsX = bounds.x;
    this._boundsZ = bounds.z;
    this.foundHash = new Uint8Array(volume);
    this.lightCache = new Int32Array(volume);

    this.voxelCache = new Uint16Array(volume);
    this.trueVoxelCache = new Uint16Array(volume);
    this.relationalVoxelCache = new Uint16Array(volume);
    this.relationalStateCache = new Uint16Array(volume);

    this.secondaryVoxelCache = new Uint16Array(volume);
    this.secondaryTrueVoxelCache = new Uint16Array(volume);
    this.secondaryRelationalVoxelCache = new Uint16Array(volume);
    this.secondaryRelationalStateCache = new Uint16Array(volume);

    this.fullBlock = new Uint8Array(volume);
    this.hasSecondary = new Uint8Array(volume);
    this.noCastAO = new Uint8Array(volume);
    this.secondaryNoCastAO = new Uint8Array(volume);
  }
  start(x: number, y: number, z: number) {
    this.offset[0] = x;
    this.offset[1] = y;
    this.offset[2] = z;
    this._offsetX = x;
    this._offsetY = y;
    this._offsetZ = z;

    this.fullBlock.fill(0);
    this.lightCache.fill(0);
    this.foundHash.fill(0);
    this.voxelCache.fill(0);
    this.trueVoxelCache.fill(0);
    this.relationalVoxelCache.fill(0);
    this.relationalStateCache.fill(0);
    this.secondaryVoxelCache.fill(0);
    this.secondaryTrueVoxelCache.fill(0);
    this.secondaryRelationalVoxelCache.fill(0);
    this.secondaryRelationalStateCache.fill(0);

    this.hasSecondary.fill(0);
    this.noCastAO.fill(0);
    this.secondaryNoCastAO.fill(0);
  }

  getIndex(x: number, y: number, z: number) {
    return Math.floor(
      z -
        this._offsetZ +
        this._boundsZ *
          (x - this._offsetX + this._boundsX * (y - this._offsetY)),
    );
  }

  getHash(dataCursor: DataCursorInterface, x: number, y: number, z: number) {
    const hashed = this.getIndex(x, y, z);
    if (this.foundHash[hashed] == 0) {
      this.hashState(dataCursor, hashed, x, y, z);
    }
    return hashed;
  }
  getNoCastAO(index: number, secondary = false) {
    return (
      (secondary ? this.secondaryNoCastAO[index] : this.noCastAO[index]) == 1
    );
  }
  getTrueVoxelId(index: number, secondary = false) {
    return secondary
      ? this.secondaryTrueVoxelCache[index]
      : this.trueVoxelCache[index];
  }
  getVoxelId(index: number, secondary = false) {
    return secondary ? this.secondaryVoxelCache[index] : this.voxelCache[index];
  }
  getRelationalState(index: number, secondary = false) {
    return secondary
      ? this.secondaryRelationalStateCache[index]
      : this.relationalStateCache[index];
  }
  getRelationalVoxelId(index: number, secondary = false) {
    return secondary
      ? this.secondaryRelationalVoxelCache[index]
      : this.relationalVoxelCache[index];
  }
  getHasSecondary(index: number) {
    return this.hasSecondary[index];
  }

  private hashState(
    dataCursor: DataCursorInterface,
    index: number,
    x: number,
    y: number,
    z: number,
  ) {
    if (this.foundHash[index] > 0) return;

    const voxel = dataCursor.getVoxel(x, y, z);

    if (voxel) {
      this.lightCache[index] = voxel.getLight();
    }

    if (!voxel) {
      this.foundHash[index] = 1;
      return;
    }
    const canHaveSecondary = voxel.canHaveSecondaryVoxel();

    voxel.setSecondary(true);
    const hasSecondary = canHaveSecondary && voxel.getStringId() !== "dve_air";
    voxel.setSecondary(false);

    if (!voxel.isRenderable() && !hasSecondary) {
      this.foundHash[index] = 1;
      return;
    }

    const trueVoxelId = voxel.getVoxelId();
    const voxelId = voxel.getId();

    this.trueVoxelCache[index] = trueVoxelId;
    this.voxelCache[index] = voxelId;

    let secondaryOpaque = false;
    let secondaryTrueVoxelId = 0;
    let secondaryVoxelId = 0;
    if (hasSecondary) {
      voxel.setSecondary(true);
      secondaryOpaque = voxel.isOpaque();
      secondaryTrueVoxelId = voxel.getVoxelId();
      secondaryVoxelId = voxel.getId();
      this.hasSecondary[index] = 1;
      this.secondaryVoxelCache[index] = secondaryVoxelId;
      this.secondaryTrueVoxelCache[index] = secondaryTrueVoxelId;
      voxel.setSecondary(false);
    }

    if (voxel.isOpaque() || secondaryOpaque) {
      this.foundHash[index] = 2;
    } else {
      this.foundHash[index] = 3;
    }

    this.fullBlock[index] = voxel.tags["dve_full_block"] ? 1 : 0;

    //no ao
    this.noCastAO[index] = voxel.isLightSource() || voxel.noAO() ? 1 : 0;
    if (hasSecondary) {
      voxel.setSecondary(true);
      this.secondaryNoCastAO[index] =
        voxel.isLightSource() || voxel.noAO() ? 1 : 0;
      voxel.setSecondary(false);
    }
    this.voxelCursor.copy(voxel).process();

    let secondaryRelationalState = 0;
    let secondaryRelationalMod = 0;

    const relationalBuilder =
      VoxelSchemas.relationalStateBuilderMap[VoxelLUT.modelsIndex[trueVoxelId]];
    relationalBuilder.position.x = x;
    relationalBuilder.position.y = y;
    relationalBuilder.position.z = z;
    relationalBuilder.voxel = this.voxelCursor;
    relationalBuilder.dataCursor = dataCursor;
    const relationalState = relationalBuilder.buildState();
    this.relationalStateCache[index] = relationalState;
    if (hasSecondary) {
      const relationalBuilder =
        VoxelSchemas.relationalStateBuilderMap[
          VoxelLUT.modelsIndex[secondaryTrueVoxelId]
        ];
      relationalBuilder.position.x = x;
      relationalBuilder.position.y = y;
      relationalBuilder.position.z = z;
      relationalBuilder.voxel = this.voxelCursor;
      relationalBuilder.dataCursor = dataCursor;
      this.voxelCursor.setSecondary(true);
      secondaryRelationalState = relationalBuilder.buildState();
      this.secondaryRelationalStateCache[index] = secondaryRelationalState;
      this.voxelCursor.setSecondary(false);
    }

    const relationalModBuilder =
      VoxelSchemas.relationalModBuilderMap[trueVoxelId];

    let relationalMod = 0;
    if (relationalModBuilder) {
      relationalModBuilder.position.x = x;
      relationalModBuilder.position.y = y;
      relationalModBuilder.position.z = z;
      relationalModBuilder.voxel = this.voxelCursor;
      relationalModBuilder.dataCursor = dataCursor;
      relationalMod = relationalModBuilder.buildState();
    }

    if (hasSecondary) {
      const relationalModBuilder =
        VoxelSchemas.relationalModBuilderMap[secondaryTrueVoxelId];
      if (relationalModBuilder) {
        relationalModBuilder.position.x = x;
        relationalModBuilder.position.y = y;
        relationalModBuilder.position.z = z;
        relationalModBuilder.voxel = this.voxelCursor;
        relationalModBuilder.dataCursor = dataCursor;
        this.voxelCursor.setSecondary(true);
        secondaryRelationalMod = relationalModBuilder.buildState();
        this.voxelCursor.setSecondary(false);
      }
    }

    this.relationalVoxelCache[index] = VoxelLUT.getRelationalVoxelId(
      trueVoxelId,
      relationalState,
      relationalMod,
    );

    if (hasSecondary) {
      this.secondaryRelationalVoxelCache[index] = VoxelLUT.getRelationalVoxelId(
        secondaryTrueVoxelId,
        secondaryRelationalState,
        secondaryRelationalMod,
      );
    }
  }
}
