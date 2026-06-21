export class ProtoVertexBuffer {
  _float32Views: Float32Array[] = [];
  _uint32Views: Uint32Array[] = [];
  sectorSize = 0;
  constructor(
    public vertexFloatSize: number,
    public sectorVertexSize: number,
    startingSectorSize = 8,
  ) {
    this.sectorSize = vertexFloatSize * sectorVertexSize;
    for (let i = 0; i < startingSectorSize; i++) {
      const float32Array = new Float32Array(this.sectorSize);
      this._float32Views[i] = float32Array;
      this._uint32Views[i] = new Uint32Array(float32Array.buffer);
    }
  }

  currentFloat32Array: Float32Array;
  currentUint32Array: Uint32Array;
  curentIndex = 0;
  _index = 0;

  setIndex(index: number) {
    this._index = index;

    const bufferIndex = Math.floor(
      (index * this.vertexFloatSize) / this.sectorSize,
    );

    if (!this._float32Views[bufferIndex]) {
      const float32Array = new Float32Array(this.sectorSize);
      this._float32Views[bufferIndex] = float32Array;
      this._uint32Views[bufferIndex] = new Uint32Array(float32Array.buffer);
    }

    this.curentIndex =
      (index * this.vertexFloatSize - bufferIndex * this.sectorSize) /
      this.vertexFloatSize;
    this.currentFloat32Array = this._float32Views[bufferIndex];
    this.currentUint32Array = this._uint32Views[bufferIndex];
  }
}

export class ProtoIndiceBuffer {
  _buffers: Uint32Array[] = [];

  constructor(
    public sectorSize: number,
    startingSectorSize = 8,
  ) {
    for (let i = 0; i < startingSectorSize; i++) {
      this._buffers.push(new Uint32Array(sectorSize));
    }
  }

  currentArray: Uint32Array;
  curentIndex = 0;
  _index = 0;

  setIndex(index: number) {
    this._index = index;

    const bufferIndex = Math.floor(index / this.sectorSize);

    if (!this._buffers[bufferIndex])
      this._buffers[bufferIndex] = new Uint32Array(this.sectorSize);

    this.curentIndex = index - bufferIndex * this.sectorSize;
    this.currentArray = this._buffers[bufferIndex];

    return this;
  }
}
