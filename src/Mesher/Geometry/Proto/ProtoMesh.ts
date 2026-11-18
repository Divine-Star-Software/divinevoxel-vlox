import { Vector3Like } from "@amodx/math";
import { ProtoVertexBuffer, ProtoIndicesBuffer } from "./ProtoMeshBuffer";

export class ProtoMesh {
  indicesCount = 0;
  vertexCount = 0;
  minBounds = Vector3Like.Create(Infinity, Infinity, Infinity);
  maxBounds = Vector3Like.Create(-Infinity, -Infinity, -Infinity);
  readonly buffer: ProtoVertexBuffer;
  readonly indices: ProtoIndicesBuffer;
  constructor(public vertexFloatSize: number) {
    this.buffer = new ProtoVertexBuffer(vertexFloatSize, 1024);
    this.indices = new ProtoIndicesBuffer(1024);
  }

  create() {
    const totalVertices = this.vertexCount * this.vertexFloatSize;
    const vertexArray = new Float32Array(totalVertices);
    const vertexBuffers = this.buffer._float32Views;

    let offset = 0;
    for (let i = 0; i < vertexBuffers.length && offset < totalVertices; i++) {
      const buffer = vertexBuffers[i];
      const remaining = totalVertices - offset;
      if (buffer.length <= remaining) {
        vertexArray.set(buffer, offset);
        offset += buffer.length;
      } else {
        vertexArray.set(buffer.subarray(0, remaining), offset);
        break;
      }
    }

    const indicesArray =
      this.indicesCount > 65535
        ? new Uint32Array(this.indicesCount)
        : new Uint16Array(this.indicesCount);

    const indicesBuffers = this.indices._buffers;
    offset = 0;
    for (
      let i = 0;
      i < indicesBuffers.length && offset < this.indicesCount;
      i++
    ) {
      const buffer = indicesBuffers[i];
      const remaining = this.indicesCount - offset;
      if (buffer.length <= remaining) {
        indicesArray.set(buffer, offset);
        offset += buffer.length;
      } else {
        indicesArray.set(buffer.subarray(0, remaining), offset);
        break;
      }
    }

    return { vertexArray, indicesArray };
  }

  addVertices(vertexCount: number, indicesCount: number) {
    this.vertexCount += vertexCount;
    this.indicesCount += indicesCount;
  }

  clear() {
    this.indicesCount = 0;
    this.vertexCount = 0;

    this.minBounds.x = Infinity;
    this.minBounds.y = Infinity;
    this.minBounds.z = Infinity;
    this.maxBounds.x = -Infinity;
    this.maxBounds.y = -Infinity;
    this.maxBounds.z = -Infinity;
  }
}
