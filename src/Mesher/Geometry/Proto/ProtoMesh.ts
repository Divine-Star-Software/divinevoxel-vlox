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
    const totalVerticies = this.vertexCount * this.vertexFloatSize;
    const vertexArray = new Float32Array(totalVerticies);
    const vertexBuffers = this.buffer._buffers;
    let start = 0;
    let done = false;
    for (let i = 0; i < vertexBuffers.length; i++) {
      const buffer = vertexBuffers[i];
      for (let j = 0; j < buffer.length; j++) {
        vertexArray[start] = buffer[j];
        start++;
        if (start > totalVerticies) {
          done = true;
          break;
        }
      }
      if (done) break;
    }
    const indiciesArray =
      this.indicieCount > 65535
        ? new Uint32Array(this.indicieCount)
        : new Uint16Array(this.indicieCount);

    const indiceBuffers = this.indices._buffers;
    start = 0;
    done = false;
    for (let i = 0; i < indiceBuffers.length; i++) {
      const buffer = indiceBuffers[i];
      for (let j = 0; j < buffer.length; j++) {
        indiciesArray[start] = buffer[j];
        start++;
        if (start > this.indicieCount) {
          done = true;
          break;
        }
      }
      if (done) break;
    }
    return {
      vertexArray,
      indiciesArray,
    };
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
