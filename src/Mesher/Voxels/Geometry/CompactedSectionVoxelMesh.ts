import { Vec3Array } from "@amodx/math";
import { LocationData } from "../../../Math";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { VoxelMeshVertexStructCursor } from "./VoxelMeshVertexStructCursor";

export class CompactedMeshData {
  material: number;
  materialId: string = "dve_solid";
  minBounds: Vec3Array = [0, 0, 0];
  maxBounds: Vec3Array = [0, 0, 0];
  vertexCount = 0;
  indexCount = 0;
  vertexIndex: [start: number, length: number] = [0, 0];
  indicesIndex: [start: number, length: number] = [0, 0];

  vertices: Float32Array;
  indices: Uint32Array;
}

export class CompactedSectionVoxelMesh {
  static GetHeaderByteSize(totalMeshes = 0) {
    return (
      //dimension index 2 bytes uint16
      2 +
      //position x 4 bytes int32
      4 +
      //position y 4 bytes int32
      4 +
      //position z 4 bytes int32
      4 +
      //total meshes
      1 +
      //bvh byte offset uint32, 0 if the section has no bvh
      4 +
      //light byte offset uint32, 0 if the section has no light data
      4 +
      //other meshes
      totalMeshes * this.GetMeshHeaderByteSize()
    );
  }
  static GetMeshHeaderByteSize() {
    return (
      //material index 1 byte
      1 +
      //min x 4 bytes Float32
      4 +
      //min y 4 bytes Float32
      4 +
      //min z 4 bytes Float32
      4 +
      //max x 4 bytes Float32
      4 +
      //max y 4 bytes Float32
      4 +
      //max z 4 bytes Float32
      4 +
      //Vertex Start Byte uint32
      4 +
      //Vertex Length
      4 +
      //Indices Start Byte uint32
      4 +
      //Indices Length
      4
    );
  }

  data: DataView;
  setData(data: ArrayBuffer) {
    this.data = new DataView(data);
  }

  setTotalMeshes(amount: number) {
    this.data.setUint8(14, amount);
  }

  getTotalMeshes() {
    return this.data.getUint8(14);
  }

  /**Byte offset of the section BVH data or 0 if none was sent. */
  setBVHByteOffset(offset: number) {
    this.data.setUint32(15, offset);
  }

  getBVHByteOffset() {
    return this.data.getUint32(15);
  }

  hasBVH() {
    return this.getBVHByteOffset() > 0;
  }

  /**Byte offset of the section light data or 0 if none was sent. */
  setLightByteOffset(offset: number) {
    this.data.setUint32(19, offset);
  }

  getLightByteOffset() {
    return this.data.getUint32(19);
  }

  /**
   * The section's voxel light if it was sent (see EngineSettings mesher.sendLightData).
   * One uint16 per voxel, sun bits 0-3, r 4-7, g 8-11, b 12-15, indexed z + x * 16 + y * 256.
   */
  getLightData(): Uint16Array | null {
    const offset = this.getLightByteOffset();
    if (!offset) return null;
    return new Uint16Array(this.data.buffer, offset, CompactedSectionVoxelMesh.LightSize);
  }

  static LightSize = 4096;

  /**
   * Returns views of the section BVH if it was sent (see EngineSettings mesher.buildBVH).
   * tree: 8191 nodes of [minX, minY, minZ, active | voxelIndex, maxX, maxY, maxZ, nodeType] in section local space.
   * indices: per voxel [indicesStart | (materialIndex << 24), indicesEnd].
   */
  getBVH(): { tree: Float32Array; indices: Uint32Array } | null {
    const offset = this.getBVHByteOffset();
    if (!offset) return null;
    const tree = new Float32Array(
      this.data.buffer,
      offset,
      CompactedSectionVoxelMesh.BVHTreeFloatSize
    );
    const indices = new Uint32Array(
      this.data.buffer,
      offset + CompactedSectionVoxelMesh.BVHTreeFloatSize * 4,
      CompactedSectionVoxelMesh.BVHIndicesSize
    );
    return { tree, indices };
  }

  static BVHTreeFloatSize = 8191 * 8;
  static BVHIndicesSize = 4096 * 2;
  static GetBVHByteSize() {
    return (this.BVHTreeFloatSize + this.BVHIndicesSize) * 4;
  }

  setLocation(dimension: number, x: number, y: number, z: number) {
    this.data.setInt16(0, dimension);
    this.data.setInt32(2, x);
    this.data.setInt32(6, y);
    this.data.setInt32(10, z);
  }

  getLocation(location: LocationData = [0, 0, 0, 0]) {
    location[0] = this.data.getInt16(0);
    location[1] = this.data.getInt32(2);
    location[2] = this.data.getInt32(6);
    location[3] = this.data.getInt32(10);
    return location;
  }

  setMeshData(index: number, mesh: CompactedMeshData) {
    const {
      materialId: material,
      minBounds,
      maxBounds,
      vertexIndex,
      indicesIndex,
    } = mesh;
    let startByte =
      CompactedSectionVoxelMesh.GetHeaderByteSize(0) +
      CompactedSectionVoxelMesh.GetMeshHeaderByteSize() * index;
    //material index
    this.data.setUint8(
      startByte,
      VoxelLUT.material.getNumberId(material)
    );
    startByte++;
    //min bounds
    this.data.setFloat32(startByte, minBounds[0]);
    startByte += 4;
    this.data.setFloat32(startByte, minBounds[1]);
    startByte += 4;
    this.data.setFloat32(startByte, minBounds[2]);
    startByte += 4;
    //max bounds
    this.data.setFloat32(startByte, maxBounds[0]);
    startByte += 4;
    this.data.setFloat32(startByte, maxBounds[1]);
    startByte += 4;
    this.data.setFloat32(startByte, maxBounds[2]);
    startByte += 4;
    //vertex index
    this.data.setUint32(startByte, vertexIndex[0]);
    startByte += 4;
    this.data.setUint32(startByte, vertexIndex[1]);
    startByte += 4;
    //indices index
    this.data.setUint32(startByte, indicesIndex[0]);
    startByte += 4;
    this.data.setUint32(startByte, indicesIndex[1]);
    startByte += 4;
  }

  getMeshData(index: number, mesh: CompactedMeshData) {
    let startByte =
      CompactedSectionVoxelMesh.GetHeaderByteSize(0) +
      CompactedSectionVoxelMesh.GetMeshHeaderByteSize() * index;

    // material index
    mesh.material = this.data.getUint8(startByte);
    mesh.materialId = VoxelLUT.material.getStringId(mesh.material);
    startByte++;

    // min bounds
    mesh.minBounds[0] = this.data.getFloat32(startByte);
    startByte += 4;
    mesh.minBounds[1] = this.data.getFloat32(startByte);
    startByte += 4;
    mesh.minBounds[2] = this.data.getFloat32(startByte);
    startByte += 4;

    // max bounds
    mesh.maxBounds[0] = this.data.getFloat32(startByte);
    startByte += 4;
    mesh.maxBounds[1] = this.data.getFloat32(startByte);
    startByte += 4;
    mesh.maxBounds[2] = this.data.getFloat32(startByte);
    startByte += 4;

    // vertex index
    mesh.vertexIndex[0] = this.data.getUint32(startByte);
    startByte += 4;
    mesh.vertexIndex[1] = this.data.getUint32(startByte);
    startByte += 4;

    // indices index
    mesh.indicesIndex[0] = this.data.getUint32(startByte);
    startByte += 4;
    mesh.indicesIndex[1] = this.data.getUint32(startByte);
    startByte += 4;

    mesh.vertices = new Float32Array(this.data.buffer, ...mesh.vertexIndex);
    mesh.indices = new Uint32Array(this.data.buffer, ...mesh.indicesIndex);

    mesh.vertexCount =
      mesh.vertexIndex[1] / VoxelMeshVertexStructCursor.VertexFloatSize;
    mesh.indexCount = mesh.indicesIndex[1];
    return mesh;
  }
}
