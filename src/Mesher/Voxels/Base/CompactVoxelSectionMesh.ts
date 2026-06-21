import { SetSectionMeshTask } from "../../Types/Mesher.types";
import { VoxelModelBuilder } from "../Models/VoxelModelBuilder";
import { VoxelMeshVertexStructCursor } from "../Geometry/VoxelMeshVertexStructCursor";
import { LocationData } from "../../../Math";
import {
  CompactedSectionVoxelMesh,
  CompactedMeshData,
} from "../Geometry/CompactedSectionVoxelMesh";

const meshData = new CompactedMeshData();
const compactedMesh = new CompactedSectionVoxelMesh();

function align4(value: number) {
  return (value + 3) & ~3;
}

export function CompactVoxelSectionMesh(
  location: LocationData,
  tools: VoxelModelBuilder[],
  transfers: any[] = [],
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

    const indexByteSize = tool.mesh.indicieCount * 4;

    totalByteCount += indexByteSize;
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

    meshData.indiceIndex[0] = byteCount;
    meshData.indiceIndex[1] = tool.mesh.indicieCount;

    const indexByteCount = tool.mesh.indicieCount * 4;

    byteCount += indexByteCount;
    byteCount = align4(byteCount);

    compactedMesh.setMeshData(i, meshData);

    const vertexArray = new Float32Array(
      buffer,
      meshData.vertexIndex[0],
      totalVertFloats,
    );

    const vertexBuffers = tool.mesh.buffer._float32Views;
    let start = 0;
    let done = false;
    for (let b = 0; b < vertexBuffers.length; b++) {
      const buf = vertexBuffers[b];
      for (let j = 0; j < buf.length; j++) {
        vertexArray[start] = buf[j];
        start++;
        if (start >= totalVertFloats) {
          done = true;
          break;
        }
      }
      if (done) break;
    }

    const indicesArray = new Uint32Array(
      buffer,
      meshData.indiceIndex[0],
      tool.mesh.indicieCount,
    );

    const indiceBuffers = tool.mesh.indices._buffers;
    start = 0;
    done = false;
    for (let b = 0; b < indiceBuffers.length; b++) {
      const buf = indiceBuffers[b];
      for (let j = 0; j < buf.length; j++) {
        indicesArray[start] = buf[j];
        start++;
        if (start >= tool.mesh.indicieCount) {
          done = true;
          break;
        }
      }
      if (done) break;
    }
  }

  transfers.push(buffer);

  return buffer as unknown as SetSectionMeshTask;
}
