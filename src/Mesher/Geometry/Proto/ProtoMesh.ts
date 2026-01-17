import { Vector3Like } from "@amodx/math";
import { ProtoVertexBuffer, ProtoIndiceBuffer } from "./ProtoMeshBuffer";

export class ProtoMesh {
  indicieCount = 0;
  vertexCount = 0;
  minBounds = Vector3Like.Create(Infinity, Infinity, Infinity);
  maxBounds = Vector3Like.Create(-Infinity, -Infinity, -Infinity);
  readonly buffer: ProtoVertexBuffer;
  readonly indices: ProtoIndiceBuffer;
  constructor(public vertexFloatSize: number) {
    this.buffer = new ProtoVertexBuffer(vertexFloatSize, 1024);
    this.indices = new ProtoIndiceBuffer(1024);
  }

  create() {
    const totalVertices = this.vertexCount * this.vertexFloatSize;
    const vertexArray = new Float32Array(totalVertices);
    const vertexBuffers = this.buffer._buffers;

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

    const indiciesArray =
      this.indicieCount > 65535
        ? new Uint32Array(this.indicieCount)
        : new Uint16Array(this.indicieCount);

    const indiceBuffers = this.indices._buffers;
    offset = 0;
    for (
      let i = 0;
      i < indiceBuffers.length && offset < this.indicieCount;
      i++
    ) {
      const buffer = indiceBuffers[i];
      const remaining = this.indicieCount - offset;
      if (buffer.length <= remaining) {
        indiciesArray.set(buffer, offset);
        offset += buffer.length;
      } else {
        indiciesArray.set(buffer.subarray(0, remaining), offset);
        break;
      }
    }

    return { vertexArray, indiciesArray };
  }

  addVerticies(vertexCount: number, indicesCount: number) {
    this.vertexCount += vertexCount;
    this.indicieCount += indicesCount;
  }

  clear() {
    this.indicieCount = 0;
    this.vertexCount = 0;

    this.minBounds.x = Infinity;
    this.minBounds.y = Infinity;
    this.minBounds.z = Infinity;
    this.maxBounds.x = -Infinity;
    this.maxBounds.y = -Infinity;
    this.maxBounds.z = -Infinity;
  }
}
