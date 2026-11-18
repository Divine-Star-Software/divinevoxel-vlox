import { QuadVertices } from "../Geometry.types.js";
import { Vector3Like, Vector2Like, Vec3Array, Vec2Array } from "@amodx/math";
type QuadDataType<Data> = [Data, Data, Data, Data];

export class QuadVertexData<Data> {
  constructor(public vertices: QuadDataType<Data>) {}

  toArray() {
    return [
      this.vertices[QuadVertices.TopRight],
      this.vertices[QuadVertices.TopLeft],
      this.vertices[QuadVertices.BottomLeft],
      this.vertices[QuadVertices.BottomRight],
    ];
  }

  setVertex(vertex: QuadVertices, value: Data) {
    this.vertices[vertex] = value;
  }

  getVertex(vertex: QuadVertices) {
    return this.vertices[vertex];
  }

  setAll(value: Data) {
    this.vertices[QuadVertices.TopRight] = value;
    this.vertices[QuadVertices.TopLeft] = value;
    this.vertices[QuadVertices.BottomLeft] = value;
    this.vertices[QuadVertices.BottomRight] = value;
  }

  set(v1: Data, v2: Data, v3: Data, v4: Data) {
    this.vertices[QuadVertices.TopRight] = v1;
    this.vertices[QuadVertices.TopLeft] = v2;
    this.vertices[QuadVertices.BottomLeft] = v3;
    this.vertices[QuadVertices.BottomRight] = v4;
  }

  isEqualTo(v1: Data, v2: Data, v3: Data, v4: Data) {
    if (this.vertices[QuadVertices.TopRight] != v1) return false;
    if (this.vertices[QuadVertices.TopLeft] != v2) return false;
    if (this.vertices[QuadVertices.BottomLeft] != v3) return false;
    if (this.vertices[QuadVertices.BottomRight] != v4) return false;
    return true;
  }

  isAllEqualTo(value: Data) {
    if (this.vertices[QuadVertices.TopRight] != value) return false;
    if (this.vertices[QuadVertices.TopLeft] != value) return false;
    if (this.vertices[QuadVertices.BottomLeft] != value) return false;
    if (this.vertices[QuadVertices.BottomRight] != value) return false;
    return true;
  }

  [Symbol.iterator](): Iterator<Data> {
    let index = QuadVertices.TopRight;
    const items = this.vertices;

    return {
      next(): IteratorResult<Data> {
        if (index < QuadVertices.BottomRight) {
          return { value: items[index++ as QuadVertices], done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  clone() {
    return new QuadVertexData<Data>([
      structuredClone(this.vertices[QuadVertices.TopRight]),
      structuredClone(this.vertices[QuadVertices.TopLeft]),
      structuredClone(this.vertices[QuadVertices.BottomLeft]),
      structuredClone(this.vertices[QuadVertices.BottomRight]),
    ]);
  }
}

export class QuadVector3VertexData extends QuadVertexData<Vector3Like> {
  constructor(
    public vertices: QuadDataType<Vector3Like> = [
      Vector3Like.Create(),
      Vector3Like.Create(),
      Vector3Like.Create(),
      Vector3Like.Create(),
    ]
  ) {
    super(vertices);
  }

  setFromQuadData(vertexData: QuadVertexData<Vector3Like>) {
    Vector3Like.Copy(
      this.vertices[QuadVertices.TopRight],
      vertexData.vertices[QuadVertices.TopRight]
    );
    Vector3Like.Copy(
      this.vertices[QuadVertices.TopLeft],
      vertexData.vertices[QuadVertices.TopLeft]
    );
    Vector3Like.Copy(
      this.vertices[QuadVertices.BottomLeft],
      vertexData.vertices[QuadVertices.BottomLeft]
    );
    Vector3Like.Copy(
      this.vertices[QuadVertices.BottomRight],
      vertexData.vertices[QuadVertices.BottomRight]
    );
  }

  addToVertex(vertex: QuadVertices, value: Vector3Like) {
    Vector3Like.AddInPlace(this.vertices[vertex], value);
  }

  subtractFromVertex(vertex: QuadVertices, value: Vector3Like) {
    Vector3Like.SubtractInPlace(this.vertices[vertex], value);
  }

  addAll(value: Vector3Like) {
    this.addToVertex(QuadVertices.TopRight, value);
    this.addToVertex(QuadVertices.TopLeft, value);
    this.addToVertex(QuadVertices.BottomLeft, value);
    this.addToVertex(QuadVertices.BottomRight, value);
  }

  subtractAll(value: Vector3Like) {
    this.subtractFromVertex(QuadVertices.TopRight, value);
    this.subtractFromVertex(QuadVertices.TopLeft, value);
    this.subtractFromVertex(QuadVertices.BottomLeft, value);
    this.subtractFromVertex(QuadVertices.BottomRight, value);
  }

  isEqualTo(
    v1: Vector3Like,
    v2: Vector3Like,
    v3: Vector3Like,
    v4: Vector3Like
  ) {
    return (
      Vector3Like.Equals(this.vertices[QuadVertices.TopRight], v1) &&
      Vector3Like.Equals(this.vertices[QuadVertices.TopLeft], v2) &&
      Vector3Like.Equals(this.vertices[QuadVertices.BottomLeft], v3) &&
      Vector3Like.Equals(this.vertices[QuadVertices.BottomRight], v4)
    );
  }

  isAllEqualTo(v1: Vector3Like) {
    return (
      Vector3Like.Equals(this.vertices[QuadVertices.TopRight], v1) &&
      Vector3Like.Equals(this.vertices[QuadVertices.TopLeft], v1) &&
      Vector3Like.Equals(this.vertices[QuadVertices.BottomLeft], v1) &&
      Vector3Like.Equals(this.vertices[QuadVertices.BottomRight], v1)
    );
  }
  clone() {
    return new QuadVector3VertexData([
      Vector3Like.Clone(this.vertices[QuadVertices.TopRight]),
      Vector3Like.Clone(this.vertices[QuadVertices.TopLeft]),
      Vector3Like.Clone(this.vertices[QuadVertices.BottomLeft]),
      Vector3Like.Clone(this.vertices[QuadVertices.BottomRight]),
    ]);
  }

  toVec3Array(): [Vec3Array, Vec3Array, Vec3Array, Vec3Array] {
    return [
      Vector3Like.ToArray(this.vertices[0]),
      Vector3Like.ToArray(this.vertices[1]),
      Vector3Like.ToArray(this.vertices[2]),
      Vector3Like.ToArray(this.vertices[3]),
    ];
  }
}

export class QuadVector2VertexData extends QuadVertexData<Vector2Like> {
  constructor(
    public vertices: QuadDataType<Vector2Like> = [
      Vector2Like.Create(),
      Vector2Like.Create(),
      Vector2Like.Create(),
      Vector2Like.Create(),
    ]
  ) {
    super(vertices);
  }

  setFromQuadData(vertexData: QuadVertexData<Vector3Like>) {
    Vector2Like.Copy(
      this.vertices[QuadVertices.TopRight],
      vertexData.vertices[QuadVertices.TopRight]
    );
    Vector2Like.Copy(
      this.vertices[QuadVertices.TopLeft],
      vertexData.vertices[QuadVertices.TopLeft]
    );
    Vector2Like.Copy(
      this.vertices[QuadVertices.BottomLeft],
      vertexData.vertices[QuadVertices.BottomLeft]
    );
    Vector2Like.Copy(
      this.vertices[QuadVertices.BottomRight],
      vertexData.vertices[QuadVertices.BottomRight]
    );
  }

  addToVertex(vertex: QuadVertices, value: Vector2Like) {
    Vector2Like.AddInPlace(this.vertices[vertex], value);
  }

  subtractFromVertex(vertex: QuadVertices, value: Vector2Like) {
    Vector2Like.SubtractInPlace(this.vertices[vertex], value);
  }

  addAll(value: Vector2Like) {
    this.addToVertex(QuadVertices.TopRight, value);
    this.addToVertex(QuadVertices.TopLeft, value);
    this.addToVertex(QuadVertices.BottomLeft, value);
    this.addToVertex(QuadVertices.BottomRight, value);
  }

  subtractAll(value: Vector2Like) {
    this.subtractFromVertex(QuadVertices.TopRight, value);
    this.subtractFromVertex(QuadVertices.TopLeft, value);
    this.subtractFromVertex(QuadVertices.BottomLeft, value);
    this.subtractFromVertex(QuadVertices.BottomRight, value);
  }

  isEqualTo(
    v1: Vector2Like,
    v2: Vector2Like,
    v3: Vector2Like,
    v4: Vector2Like
  ) {
    return (
      Vector2Like.Equals(this.vertices[QuadVertices.TopRight], v1) &&
      Vector2Like.Equals(this.vertices[QuadVertices.TopLeft], v2) &&
      Vector2Like.Equals(this.vertices[QuadVertices.BottomLeft], v3) &&
      Vector2Like.Equals(this.vertices[QuadVertices.BottomRight], v4)
    );
  }
  isAllEqualTo(v1: Vector2Like) {
    return (
      Vector2Like.Equals(this.vertices[QuadVertices.TopRight], v1) &&
      Vector2Like.Equals(this.vertices[QuadVertices.TopLeft], v1) &&
      Vector2Like.Equals(this.vertices[QuadVertices.BottomLeft], v1) &&
      Vector2Like.Equals(this.vertices[QuadVertices.BottomRight], v1)
    );
  }

  toVec2Array(): [Vec2Array, Vec2Array, Vec2Array, Vec2Array] {
    return [
      Vector2Like.ToArray(this.vertices[0]),
      Vector2Like.ToArray(this.vertices[1]),
      Vector2Like.ToArray(this.vertices[2]),
      Vector2Like.ToArray(this.vertices[3]),
    ];
  }

  clone() {
    return new QuadVector2VertexData([
      Vector2Like.Clone(this.vertices[QuadVertices.TopRight]),
      Vector2Like.Clone(this.vertices[QuadVertices.TopLeft]),
      Vector2Like.Clone(this.vertices[QuadVertices.BottomLeft]),
      Vector2Like.Clone(this.vertices[QuadVertices.BottomRight]),
    ]);
  }
}

export class QuadScalarVertexData extends QuadVertexData<number> {
  constructor(public vertices: QuadDataType<number> = [0, 0, 0, 0]) {
    super(vertices);
  }

  setFromQuadData(vertexData: QuadVertexData<number>) {
    this.vertices[QuadVertices.TopRight] =
      vertexData.vertices[QuadVertices.TopRight];
    this.vertices[QuadVertices.TopLeft] =
      vertexData.vertices[QuadVertices.TopLeft];
    this.vertices[QuadVertices.BottomLeft] =
      vertexData.vertices[QuadVertices.BottomLeft];
    this.vertices[QuadVertices.BottomRight] =
      vertexData.vertices[QuadVertices.BottomRight];
  }

  subtractFromVertex(vertex: QuadVertices, value: number) {
    this.vertices[vertex] -= value;
  }

  addAll(value: number) {
    this.vertices[QuadVertices.TopRight] += value;
    this.vertices[QuadVertices.TopLeft] += value;
    this.vertices[QuadVertices.BottomLeft] += value;
    this.vertices[QuadVertices.BottomRight] += value;
  }

  add(v1: number, v2: number, v3: number, v4: number) {
    this.vertices[QuadVertices.TopRight] += v1;
    this.vertices[QuadVertices.TopLeft] += v2;
    this.vertices[QuadVertices.BottomLeft] += v3;
    this.vertices[QuadVertices.BottomRight] += v4;
  }

  subtractAll(value: number) {
    this.vertices[QuadVertices.TopRight] -= value;
    this.vertices[QuadVertices.TopLeft] -= value;
    this.vertices[QuadVertices.BottomLeft] -= value;
    this.vertices[QuadVertices.BottomRight] -= value;
  }

  subtract(v1: number, v2: number, v3: number, v4: number) {
    this.vertices[QuadVertices.TopRight] += v1;
    this.vertices[QuadVertices.TopLeft] += v2;
    this.vertices[QuadVertices.BottomLeft] += v3;
    this.vertices[QuadVertices.BottomRight] += v4;
  }

  isGreaterThan(v1: number, v2: number, v3: number, v4: number) {
    if (this.vertices[QuadVertices.TopRight] < v1) return false;
    if (this.vertices[QuadVertices.TopLeft] < v2) return false;
    if (this.vertices[QuadVertices.BottomLeft] < v3) return false;
    if (this.vertices[QuadVertices.BottomRight] < v4) return false;
    return true;
  }

  isAllGreaterThan(value: number) {
    if (this.vertices[QuadVertices.TopRight] < value) return false;
    if (this.vertices[QuadVertices.TopLeft] < value) return false;
    if (this.vertices[QuadVertices.BottomLeft] < value) return false;
    if (this.vertices[QuadVertices.BottomRight] < value) return false;
    return true;
  }

  isLessThan(v1: number, v2: number, v3: number, v4: number) {
    if (this.vertices[QuadVertices.TopRight] > v1) return false;
    if (this.vertices[QuadVertices.TopLeft] > v2) return false;
    if (this.vertices[QuadVertices.BottomLeft] > v3) return false;
    if (this.vertices[QuadVertices.BottomRight] > v4) return false;
    return true;
  }

  isAllLessThan(value: number) {
    if (this.vertices[QuadVertices.TopRight] > value) return false;
    if (this.vertices[QuadVertices.TopLeft] > value) return false;
    if (this.vertices[QuadVertices.BottomLeft] > value) return false;
    if (this.vertices[QuadVertices.BottomRight] > value) return false;
    return true;
  }

  clone() {
    return new QuadScalarVertexData([
      this.vertices[QuadVertices.TopRight],
      this.vertices[QuadVertices.TopLeft],
      this.vertices[QuadVertices.BottomLeft],
      this.vertices[QuadVertices.BottomRight],
    ]);
  }
}
