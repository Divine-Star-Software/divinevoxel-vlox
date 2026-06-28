import { DataCursorInterface } from "../../../Voxels/Cursor/DataCursor.interface";
import { Vec3Array, Vector3Like } from "@amodx/math";
import { VoxelCursor } from "../../../Voxels/Cursor/VoxelCursor";
import { GetYXZOrderArrayIndex } from "../../../Math/Indexing";
import { VoxelSchemas } from "../../../Voxels/State/VoxelSchemas";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
export class VoxelGeometryBuilderCacheSpace {
  foundHash: Uint8Array;
  lightCache: Int32Array;
  //cache of the voxel ids
  private voxelCache: Uint16Array;
  //cache of the true voxel ids
  private trueVoxelCache: Uint16Array;
  //cache of the reltional voxel ids
  private reltionalVoxelCache: Uint16Array;
  //cache of the reltional state
  private reltionalStateCache: Uint16Array;

  //cache of the secondary voxel ids
  secondaryVoxelCache: Uint16Array;
  //cache of the true secondary voxel ids
  secondaryTrueVoxelCache: Uint16Array;
  //cache of the reltional secondary voxel ids
  secondaryReltionalVoxelCache: Uint16Array;
  //cache of the secondary reltional state
  secondaryReltionalStateCache: Uint16Array;

  hasSecondary: Uint8Array;
  noCastAO: Uint8Array;
  secondaryNoCastAO: Uint8Array;
  fullBlock: Uint8Array;
  offset: Vec3Array = [0, 0, 0];

  voxelCursor = new VoxelCursor();

  constructor(public bounds: Vector3Like) {
    const volume = bounds.x * bounds.y * bounds.z;
    this.foundHash = new Uint8Array(volume);
    this.lightCache = new Int32Array(volume);

    this.voxelCache = new Uint16Array(volume);
    this.trueVoxelCache = new Uint16Array(volume);
    this.reltionalVoxelCache = new Uint16Array(volume);
    this.reltionalStateCache = new Uint16Array(volume);

    this.secondaryVoxelCache = new Uint16Array(volume);
    this.secondaryTrueVoxelCache = new Uint16Array(volume);
    this.secondaryReltionalVoxelCache = new Uint16Array(volume);
    this.secondaryReltionalStateCache = new Uint16Array(volume);

    this.fullBlock = new Uint8Array(volume);
    this.hasSecondary = new Uint8Array(volume);
    this.noCastAO = new Uint8Array(volume);
    this.secondaryNoCastAO = new Uint8Array(volume);
  }
  start(x: number, y: number, z: number) {
    this.offset[0] = x;
    this.offset[1] = y;
    this.offset[2] = z;

    this.fullBlock.fill(0);
    this.lightCache.fill(0);
    this.foundHash.fill(0);
    this.voxelCache.fill(0);
    this.trueVoxelCache.fill(0);
    this.reltionalVoxelCache.fill(0);
    this.reltionalStateCache.fill(0);
    this.secondaryVoxelCache.fill(0);
    this.secondaryTrueVoxelCache.fill(0);
    this.secondaryReltionalVoxelCache.fill(0);
    this.secondaryReltionalStateCache.fill(0);

    this.hasSecondary.fill(0);
    this.noCastAO.fill(0);
    this.secondaryNoCastAO.fill(0);
  }

  getIndex(x: number, y: number, z: number) {
    return GetYXZOrderArrayIndex(
      x - this.offset[0],
      y - this.offset[1],
      z - this.offset[2],
      this.bounds.x,
      this.bounds.y,
      this.bounds.z,
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
      ? this.secondaryReltionalStateCache[index]
      : this.reltionalStateCache[index];
  }
  getRelationalVoxelId(index: number, secondary = false) {
    return secondary
      ? this.secondaryReltionalVoxelCache[index]
      : this.reltionalVoxelCache[index];
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

    if (!voxel.isRenderable() || !hasSecondary) {
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
      VoxelSchemas.reltionalStateBuilderMap[VoxelLUT.modelsIndex[trueVoxelId]];
    relationalBuilder.position.x = x;
    relationalBuilder.position.y = y;
    relationalBuilder.position.z = z;
    relationalBuilder.voxel = this.voxelCursor;
    relationalBuilder.dataCursor = dataCursor;
    const reltionalState = relationalBuilder.buildState();
    this.reltionalStateCache[index] = reltionalState;
    if (hasSecondary) {
      const relationalBuilder =
        VoxelSchemas.reltionalStateBuilderMap[
          VoxelLUT.modelsIndex[secondaryTrueVoxelId]
        ];
      relationalBuilder.position.x = x;
      relationalBuilder.position.y = y;
      relationalBuilder.position.z = z;
      relationalBuilder.voxel = this.voxelCursor;
      relationalBuilder.dataCursor = dataCursor;
      this.voxelCursor.setSecondary(true);
      secondaryRelationalState = relationalBuilder.buildState();
      this.secondaryReltionalStateCache[index] = secondaryRelationalState;
      this.voxelCursor.setSecondary(false);
    }

    const relationalModBuilder =
      VoxelSchemas.reltionalModBuilderMap[trueVoxelId];

    let reltionalMod = 0;
    if (relationalModBuilder) {
      relationalModBuilder.position.x = x;
      relationalModBuilder.position.y = y;
      relationalModBuilder.position.z = z;
      relationalModBuilder.voxel = this.voxelCursor;
      relationalModBuilder.dataCursor = dataCursor;
      reltionalMod = relationalModBuilder.buildState();
    }

    if (hasSecondary) {
      const relationalModBuilder =
        VoxelSchemas.reltionalModBuilderMap[secondaryTrueVoxelId];
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

    this.reltionalVoxelCache[index] = VoxelLUT.getReltionalVoxelId(
      trueVoxelId,
      reltionalState,
      reltionalMod,
    );

    if (hasSecondary) {
      this.secondaryReltionalVoxelCache[index] = VoxelLUT.getReltionalVoxelId(
        secondaryTrueVoxelId,
        secondaryRelationalState,
        secondaryRelationalMod,
      );
    }
  }
}
