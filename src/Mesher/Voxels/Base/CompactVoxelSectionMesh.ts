import { SetSectionMeshTask } from "../../Types/Mesher.types";
import { VoxelModelBuilder } from "../Models/VoxelModelBuilder";
import { VoxelMeshVertexStructCursor } from "../Geometry/VoxelMeshVertexStructCursor";
import { LocationData } from "../../../Math";
import {
  CompactedSectionVoxelMesh,
  CompactedMeshData,
} from "../Geometry/CompactedSectionVoxelMesh";
import type { VoxelMeshBVHBuilder } from "../Geometry/VoxelMeshBVHBuilder";

const meshData = new CompactedMeshData();
const compactedMesh = new CompactedSectionVoxelMesh();

function align4(value: number) {
  return (value + 3) & ~3;
}

function copyBuffers(
  target: Float32Array | Uint32Array,
  buffers: ArrayLike<Float32Array | Uint32Array>,
  total: number,
) {
  let start = 0;
  for (let b = 0; b < buffers.length && start < total; b++) {
    const buf = buffers[b];
    const count = Math.min(buf.length, total - start);
    target.set(count == buf.length ? buf : buf.subarray(0, count), start);
    start += count;
  }
}

export function CompactVoxelSectionMesh(
  location: LocationData,
  tools: VoxelModelBuilder[],
  transfers: any[] = [],
  /**If set the section BVH is appended to the end of the buffer. */
  bvh: VoxelMeshBVHBuilder | null = null,
  /**If set the section voxel light is appended to the end of the buffer. */
  light: Uint16Array | null = null,
): SetSectionMeshTask {
  let headerSize = CompactedSectionVoxelMesh.GetHeaderByteSize(tools.length);

  headerSize = align4(headerSize);

  let totalByteCount = headerSize;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];

    const vertexByteSize =
      tool.mesh.vertexCount * VoxelMeshVertexStructCursor.VertexByteSize;
    totalByteCount += vertexByteSize;
    totalByteCount = align4(totalByteCount);

    const indexByteSize = tool.mesh.indicesCount * 4;

    totalByteCount += indexByteSize;
    totalByteCount = align4(totalByteCount);
  }

  let bvhByteOffset = 0;
  if (bvh) {
    bvhByteOffset = totalByteCount;
    totalByteCount += CompactedSectionVoxelMesh.GetBVHByteSize();
  }
  let lightByteOffset = 0;
  if (light) {
    lightByteOffset = totalByteCount;
    totalByteCount += CompactedSectionVoxelMesh.LightSize * 2;
    totalByteCount = align4(totalByteCount);
  }

  const buffer = new ArrayBuffer(totalByteCount);

  compactedMesh.setData(buffer);
  compactedMesh.setLocation(...location);
  compactedMesh.setTotalMeshes(tools.length);

  let byteCount = headerSize;
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];

    meshData.materialId = tool.id;

    const minBounds = tool.mesh.minBounds;
    const maxBounds = tool.mesh.maxBounds;
    meshData.minBounds[0] = minBounds.x;
    meshData.minBounds[1] = minBounds.y;
    meshData.minBounds[2] = minBounds.z;
    meshData.maxBounds[0] = maxBounds.x;
    meshData.maxBounds[1] = maxBounds.y;
    meshData.maxBounds[2] = maxBounds.z;

    const totalVertFloats =
      tool.mesh.vertexCount * VoxelMeshVertexStructCursor.VertexFloatSize;
    const vertexByteCount = totalVertFloats * 4;

    meshData.vertexIndex[0] = byteCount;
    meshData.vertexIndex[1] = totalVertFloats;

    byteCount += vertexByteCount;
    byteCount = align4(byteCount);

    meshData.indicesIndex[0] = byteCount;
    meshData.indicesIndex[1] = tool.mesh.indicesCount;

    const indexByteCount = tool.mesh.indicesCount * 4;

    byteCount += indexByteCount;
    byteCount = align4(byteCount);

    compactedMesh.setMeshData(i, meshData);

    const vertexArray = new Float32Array(
      buffer,
      meshData.vertexIndex[0],
      totalVertFloats,
    );

    copyBuffers(vertexArray, tool.mesh.buffer._float32Views, totalVertFloats);

    const indicesArray = new Uint32Array(
      buffer,
      meshData.indicesIndex[0],
      tool.mesh.indicesCount,
    );

    copyBuffers(indicesArray, tool.mesh.indices._buffers, tool.mesh.indicesCount);
  }

  if (bvh) {
    compactedMesh.setBVHByteOffset(bvhByteOffset);
    new Float32Array(
      buffer,
      bvhByteOffset,
      CompactedSectionVoxelMesh.BVHTreeFloatSize,
    ).set(bvh.tree);
    new Uint32Array(
      buffer,
      bvhByteOffset + CompactedSectionVoxelMesh.BVHTreeFloatSize * 4,
      CompactedSectionVoxelMesh.BVHIndicesSize,
    ).set(bvh.indices);
  }

  if (light) {
    compactedMesh.setLightByteOffset(lightByteOffset);
    new Uint16Array(buffer, lightByteOffset, CompactedSectionVoxelMesh.LightSize).set(
      light.subarray(0, CompactedSectionVoxelMesh.LightSize),
    );
  }

  transfers.push(buffer);

  return buffer as unknown as SetSectionMeshTask;
}
