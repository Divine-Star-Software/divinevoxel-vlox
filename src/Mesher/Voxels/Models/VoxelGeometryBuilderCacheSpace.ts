import { DataCursorInterface } from "../../../Voxels/Cursor/DataCursor.interface";
import { Vec3Array, Vector3Like } from "@amodx/math";
import { VoxelCursor } from "../../../Voxels/Cursor/VoxelCursor";
import { GetYXZOrderArrayIndex } from "../../../Math/Indexing";
import { VoxelSchemas } from "../../../Voxels/State/VoxelSchemas";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
export class VoxelGeometryBuilderCacheSpace {
  foundHash: Uint8Array;
  //cache of the voxel ids
  voxelCache: Uint16Array;
  //cache of the true voxel ids
  trueVoxelCache: Uint16Array;
  //cache of the reltional voxel ids
  reltionalVoxelCache: Uint16Array;

  //cache of the reltional state
  reltionalStateCache: Uint16Array;

  noCastAO: Uint8Array;
  offset: Vec3Array = [0, 0, 0];

  voxelCursor = new VoxelCursor();

  constructor(public bounds: Vector3Like) {
    const volume = bounds.x * bounds.y * bounds.z;
    this.foundHash = new Uint8Array(volume);
    this.voxelCache = new Uint16Array(volume);
    this.trueVoxelCache = new Uint16Array(volume);
    this.reltionalVoxelCache = new Uint16Array(volume);
    this.reltionalStateCache = new Uint16Array(volume);

    this.noCastAO = new Uint8Array(volume);
  }
  start(x: number, y: number, z: number) {
    this.offset[0] = x;
    this.offset[1] = y;
    this.offset[2] = z;

    this.foundHash.fill(0);
    this.voxelCache.fill(0);
    this.trueVoxelCache.fill(0);
    this.reltionalVoxelCache.fill(0);
    this.reltionalStateCache.fill(0);

    this.noCastAO.fill(0);
  }

  getIndex(x: number, y: number, z: number) {
    return GetYXZOrderArrayIndex(
      x - this.offset[0],
      y - this.offset[1],
      z - this.offset[2],
      this.bounds.x,
      this.bounds.y,
      this.bounds.z
    );
  }

  getHash(dataCursor: DataCursorInterface, x: number, y: number, z: number) {
    const hashed = this.getIndex(x, y, z);
    if (this.foundHash[hashed] == 0) {
      this.hashState(dataCursor, hashed, x, y, z);
    }
    return hashed;
  }

  private hashState(
    dataCursor: DataCursorInterface,
    index: number,
    x: number,
    y: number,
    z: number
  ) {
    if (this.foundHash[index] == 1) return;
    if (this.foundHash[index] == 2) return;

    const voxel = dataCursor.getVoxel(x, y, z);

    if (!voxel || !voxel.isRenderable()) {
      this.foundHash[index] = 1;
      return;
    }

    const trueVoxelId = voxel.getVoxelId();
    const voxelId = voxel.getId();

    this.trueVoxelCache[index] = trueVoxelId;
    this.voxelCache[index] = voxelId;

    this.foundHash[index] = 2;

    //no ao
    this.noCastAO[index] = voxel.isLightSource() || voxel.noAO() ? 1 : 0;

    this.voxelCursor.copy(voxel).process();

    const reltioanlBuilder = VoxelSchemas.reltionalStateBuilder.get(
      VoxelLUT.models.getStringId(VoxelLUT.modelsIndex[trueVoxelId])
    )!;
    reltioanlBuilder.position.x = x;
    reltioanlBuilder.position.y = y;
    reltioanlBuilder.position.z = z;
    reltioanlBuilder.voxel = this.voxelCursor;
    reltioanlBuilder.dataCursor = dataCursor;
    const reltionalState = reltioanlBuilder.buildState();
    this.reltionalStateCache[index] = reltionalState;

    const reltioanlModBuilder = VoxelSchemas.reltionalModBuilder.get(
      VoxelLUT.voxelIds.getStringId(trueVoxelId)
    )!;

    let reltionalMod = 0;
    if (reltioanlModBuilder) {
      reltioanlModBuilder.position.x = x;
      reltioanlModBuilder.position.y = y;
      reltioanlModBuilder.position.z = z;
      reltioanlModBuilder.voxel = this.voxelCursor;
      reltioanlModBuilder.dataCursor = dataCursor;
      reltionalMod = reltioanlModBuilder.buildState();
    } else {
      this.reltionalVoxelCache[index] = 0;
    }

    this.reltionalVoxelCache[index] = VoxelLUT.getReltionalVoxelId(
      trueVoxelId,
      reltionalState,
      reltionalMod
    );
  }
}
