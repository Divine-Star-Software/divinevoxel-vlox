import { Vector3Like, Vector2Like, Vec3Array, Vec2Array } from "@amodx/math";
import { TriangleVertices } from "../Geometry.types";
type TriangleDataType<Data> = [Data, Data, Data];

export class TriangleVertexData<Data> {
  constructor(public vertices: TriangleDataType<Data>) {}

  toArray() {
    return [
      this.vertices[TriangleVertices.One],
      this.vertices[TriangleVertices.Two],
      this.vertices[TriangleVertices.Three],
    ];
  }

  setVertex(vertex: TriangleVertices, value: Data) {
    this.vertices[vertex] = value;
  }

  getVertex(vertex: TriangleVertices) {
    return this.vertices[vertex];
  }

  setAll(value: Data) {
    this.vertices[TriangleVertices.One] = value;
    this.vertices[TriangleVertices.Two] = value;
    this.vertices[TriangleVertices.Three] = value;
  }

  set(v1: Data, v2: Data, v3: Data) {
    this.vertices[TriangleVertices.One] = v1;
    this.vertices[TriangleVertices.Two] = v2;
    this.vertices[TriangleVertices.Three] = v3;
  }

  isEqualTo(v1: Data, v2: Data, v3: Data) {
    if (this.vertices[TriangleVertices.One] != v1) return false;
    if (this.vertices[TriangleVertices.Two] != v2) return false;
    if (this.vertices[TriangleVertices.Three] != v3) return false;
    return true;
  }

  isAllEqualTo(value: Data) {
    if (this.vertices[TriangleVertices.One] != value) return false;
    if (this.vertices[TriangleVertices.Two] != value) return false;
    if (this.vertices[TriangleVertices.Three] != value) return false;
    return true;
  }

  [Symbol.iterator](): Iterator<Data> {
    let index = TriangleVertices.One;
    const items = this.vertices;

    return {
      next(): IteratorResult<Data> {
        if (index < TriangleVertices.Three) {
          return { value: items[index++ as TriangleVertices], done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  clone() {
    return new TriangleVertexData<Data>([
      structuredClone(this.vertices[TriangleVertices.One]),
      structuredClone(this.vertices[TriangleVertices.Two]),
      structuredClone(this.vertices[TriangleVertices.Three]),
    ]);
  }
}

export class TriangleVector3VertexData extends TriangleVertexData<Vector3Like> {
  constructor(
    public vertices: TriangleDataType<Vector3Like> = [
      Vector3Like.Create(),
      Vector3Like.Create(),
      Vector3Like.Create(),
    ]
  ) {
    super(vertices);
  }

  setFromQuadData(vertexData: TriangleVertexData<Vector3Like>) {
    Vector3Like.Copy(
      this.vertices[TriangleVertices.One],
      vertexData.vertices[TriangleVertices.One]
    );
    Vector3Like.Copy(
      this.vertices[TriangleVertices.Two],
      vertexData.vertices[TriangleVertices.Two]
    );
    Vector3Like.Copy(
      this.vertices[TriangleVertices.Three],
      vertexData.vertices[TriangleVertices.Three]
    );
  }

  addToVertex(vertex: TriangleVertices, value: Vector3Like) {
    Vector3Like.AddInPlace(this.vertices[vertex], value);
  }

  subtractFromVertex(vertex: TriangleVertices, value: Vector3Like) {
    Vector3Like.SubtractInPlace(this.vertices[vertex], value);
  }

  addAll(value: Vector3Like) {
    this.addToVertex(TriangleVertices.One, value);
    this.addToVertex(TriangleVertices.Two, value);
    this.addToVertex(TriangleVertices.Three, value);
  }

  subtractAll(value: Vector3Like) {
    this.subtractFromVertex(TriangleVertices.One, value);
    this.subtractFromVertex(TriangleVertices.Two, value);
    this.subtractFromVertex(TriangleVertices.Three, value);
  }

  isEqualTo(v1: Vector3Like, v2: Vector3Like, v3: Vector3Like) {
    return (
      Vector3Like.Equals(this.vertices[TriangleVertices.One], v1) &&
      Vector3Like.Equals(this.vertices[TriangleVertices.Two], v2) &&
      Vector3Like.Equals(this.vertices[TriangleVertices.Three], v3)
    );
  }

  isAllEqualTo(v1: Vector3Like) {
    return (
      Vector3Like.Equals(this.vertices[TriangleVertices.One], v1) &&
      Vector3Like.Equals(this.vertices[TriangleVertices.Two], v1) &&
      Vector3Like.Equals(this.vertices[TriangleVertices.Three], v1)
    );
  }
  clone() {
    return new TriangleVector3VertexData([
      Vector3Like.Clone(this.vertices[TriangleVertices.One]),
      Vector3Like.Clone(this.vertices[TriangleVertices.Two]),
      Vector3Like.Clone(this.vertices[TriangleVertices.Three]),
    ]);
  }

  toVec3Array(): [Vec3Array, Vec3Array, Vec3Array] {
    return [
      Vector3Like.ToArray(this.vertices[0]),
      Vector3Like.ToArray(this.vertices[1]),
      Vector3Like.ToArray(this.vertices[2]),
    ];
  }
}

export class TriangleVector2VertexData extends TriangleVertexData<Vector2Like> {
  constructor(
    public vertices: TriangleDataType<Vector2Like> = [
      Vector2Like.Create(),
      Vector2Like.Create(),
      Vector2Like.Create(),
    ]
  ) {
    super(vertices);
  }

  setFromQuadData(vertexData: TriangleVertexData<Vector3Like>) {
    Vector2Like.Copy(
      this.vertices[TriangleVertices.One],
      vertexData.vertices[TriangleVertices.One]
    );
    Vector2Like.Copy(
      this.vertices[TriangleVertices.Two],
      vertexData.vertices[TriangleVertices.Two]
    );
    Vector2Like.Copy(
      this.vertices[TriangleVertices.Three],
      vertexData.vertices[TriangleVertices.Three]
    );
  }

  addToVertex(vertex: TriangleVertices, value: Vector2Like) {
    Vector2Like.AddInPlace(this.vertices[vertex], value);
  }

  subtractFromVertex(vertex: TriangleVertices, value: Vector2Like) {
    Vector2Like.SubtractInPlace(this.vertices[vertex], value);
  }

  addAll(value: Vector2Like) {
    this.addToVertex(TriangleVertices.One, value);
    this.addToVertex(TriangleVertices.Two, value);
    this.addToVertex(TriangleVertices.Three, value);
  }

  subtractAll(value: Vector2Like) {
    this.subtractFromVertex(TriangleVertices.One, value);
    this.subtractFromVertex(TriangleVertices.Two, value);
    this.subtractFromVertex(TriangleVertices.Three, value);
  }

  isEqualTo(v1: Vector2Like, v2: Vector2Like, v3: Vector2Like) {
    return (
      Vector2Like.Equals(this.vertices[TriangleVertices.One], v1) &&
      Vector2Like.Equals(this.vertices[TriangleVertices.Two], v2) &&
      Vector2Like.Equals(this.vertices[TriangleVertices.Three], v3)
    );
  }
  isAllEqualTo(v1: Vector2Like) {
    return (
      Vector2Like.Equals(this.vertices[TriangleVertices.One], v1) &&
      Vector2Like.Equals(this.vertices[TriangleVertices.Two], v1) &&
      Vector2Like.Equals(this.vertices[TriangleVertices.Three], v1)
    );
  }

  toVec2Array(): [Vec2Array, Vec2Array, Vec2Array] {
    return [
      Vector2Like.ToArray(this.vertices[0]),
      Vector2Like.ToArray(this.vertices[1]),
      Vector2Like.ToArray(this.vertices[2]),
    ];
  }

  clone() {
    return new TriangleVector2VertexData([
      Vector2Like.Clone(this.vertices[TriangleVertices.One]),
      Vector2Like.Clone(this.vertices[TriangleVertices.Two]),
      Vector2Like.Clone(this.vertices[TriangleVertices.Three]),
    ]);
  }
}

export class TriangleScalarVertexData extends TriangleVertexData<number> {
  constructor(public vertices: TriangleDataType<number> = [0, 0, 0]) {
    super(vertices);
  }

  setFromQuadData(vertexData: TriangleVertexData<number>) {
    this.vertices[TriangleVertices.One] =
      vertexData.vertices[TriangleVertices.One];
    this.vertices[TriangleVertices.Two] =
      vertexData.vertices[TriangleVertices.Two];
    this.vertices[TriangleVertices.Three] =
      vertexData.vertices[TriangleVertices.Three];
  }

  subtractFromVertex(vertex: TriangleVertices, value: number) {
    this.vertices[vertex] -= value;
  }

  addAll(value: number) {
    this.vertices[TriangleVertices.One] += value;
    this.vertices[TriangleVertices.Two] += value;
    this.vertices[TriangleVertices.Three] += value;
  }

  add(v1: number, v2: number, v3: number, v4: number) {
    this.vertices[TriangleVertices.One] += v1;
    this.vertices[TriangleVertices.Two] += v2;
    this.vertices[TriangleVertices.Three] += v3;
  }

  subtractAll(value: number) {
    this.vertices[TriangleVertices.One] -= value;
    this.vertices[TriangleVertices.Two] -= value;
    this.vertices[TriangleVertices.Three] -= value;
  }

  subtract(v1: number, v2: number, v3: number, v4: number) {
    this.vertices[TriangleVertices.One] += v1;
    this.vertices[TriangleVertices.Two] += v2;
    this.vertices[TriangleVertices.Three] += v3;
  }

  isGreaterThan(v1: number, v2: number, v3: number, v4: number) {
    if (this.vertices[TriangleVertices.One] < v1) return false;
    if (this.vertices[TriangleVertices.Two] < v2) return false;
    if (this.vertices[TriangleVertices.Three] < v3) return false;

    return true;
  }

  isAllGreaterThan(value: number) {
    if (this.vertices[TriangleVertices.One] < value) return false;
    if (this.vertices[TriangleVertices.Two] < value) return false;
    if (this.vertices[TriangleVertices.Three] < value) return false;

    return true;
  }

  isLessThan(v1: number, v2: number, v3: number, v4: number) {
    if (this.vertices[TriangleVertices.One] > v1) return false;
    if (this.vertices[TriangleVertices.Two] > v2) return false;
    if (this.vertices[TriangleVertices.Three] > v3) return false;

    return true;
  }

  isAllLessThan(value: number) {
    if (this.vertices[TriangleVertices.One] > value) return false;
    if (this.vertices[TriangleVertices.Two] > value) return false;
    if (this.vertices[TriangleVertices.Three] > value) return false;

    return true;
  }

  clone() {
    return new TriangleScalarVertexData([
      this.vertices[TriangleVertices.One],
      this.vertices[TriangleVertices.Two],
      this.vertices[TriangleVertices.Three],
    ]);
  }
}
