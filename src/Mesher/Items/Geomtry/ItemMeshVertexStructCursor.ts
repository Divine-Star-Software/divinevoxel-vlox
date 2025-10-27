export const ItemMeshVertexConstants = {
  VertexFloatSize: 12,
  VertexByteSize: 12 * 4,
  PositionOffset: 0,
  NormalOffset: 4,
  TextureIndexOffset: 8,
  UVOffset: 10,
};

export class ItemMeshVertexStructCursor {
  static get VertexFloatSize() {
    return ItemMeshVertexConstants.VertexFloatSize;
  }
  static get VertexByteSize() {
    return ItemMeshVertexConstants.VertexByteSize;
  }
  static get PositionOffset() {
    return ItemMeshVertexConstants.PositionOffset;
  }

  static get NormalOffset() {
    return ItemMeshVertexConstants.NormalOffset;
  }
  static get TextureIndexOffset() {
    return ItemMeshVertexConstants.TextureIndexOffset;
  }
  static get UVOffset() {
    return ItemMeshVertexConstants.UVOffset;
  }

  // position
  get positionX() {
    return this.data[
      this.trueIndex + ItemMeshVertexStructCursor.PositionOffset
    ];
  }
  set positionX(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.PositionOffset] =
      value;
  }

  get positionY() {
    return this.data[
      this.trueIndex + ItemMeshVertexStructCursor.PositionOffset + 1
    ];
  }
  set positionY(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.PositionOffset + 1] =
      value;
  }

  get positionZ() {
    return this.data[
      this.trueIndex + ItemMeshVertexStructCursor.PositionOffset + 2
    ];
  }
  set positionZ(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.PositionOffset + 2] =
      value;
  }

  // normal
  get normalX() {
    return this.data[this.trueIndex + ItemMeshVertexStructCursor.NormalOffset];
  }
  set normalX(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.NormalOffset] = value;
  }

  get normalY() {
    return this.data[
      this.trueIndex + ItemMeshVertexStructCursor.NormalOffset + 1
    ];
  }
  set normalY(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.NormalOffset + 1] =
      value;
  }

  get normalZ() {
    return this.data[
      this.trueIndex + ItemMeshVertexStructCursor.NormalOffset + 2
    ];
  }
  set normalZ(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.NormalOffset + 2] =
      value;
  }

  // texture index
  get textureIndex() {
    return this.data[
      this.trueIndex + ItemMeshVertexStructCursor.TextureIndexOffset
    ];
  }
  set textureIndex(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.TextureIndexOffset] =
      value;
  }

  // uv
  get uvX() {
    return this.data[this.trueIndex + ItemMeshVertexStructCursor.UVOffset];
  }
  set uvX(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.UVOffset] = value;
  }

  get uvY() {
    return this.data[this.trueIndex + ItemMeshVertexStructCursor.UVOffset + 1];
  }
  set uvY(value: number) {
    this.data[this.trueIndex + ItemMeshVertexStructCursor.UVOffset + 1] = value;
  }

  trueIndex = 0;
  _index = 0;
  data: { [index: number]: number };
  get index() {
    return this._index;
  }
  set index(index: number) {
    this._index = index;
    this.trueIndex = index * ItemMeshVertexStructCursor.VertexFloatSize;
  }

  constructor(data?: Float32Array) {
    if (data) this.data = data;
  }

  toJSON() {
    return {
      position: [this.positionX, this.positionY, this.positionZ],
      normal: [this.normalX, this.normalY, this.normalZ],
      textureIndex: this.textureIndex,
      uv: [this.uvX, this.uvY],
    };
  }
}
