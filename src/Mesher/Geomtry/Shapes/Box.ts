import { Vec3Array } from "@amodx/math";
import { Quad } from "../Primitives";
import { VoxelFaces } from "../../../Math";

type BoxPoints = [Vec3Array, Vec3Array];
export class Box {
  static Create(
    points: BoxPoints = [
      [0, 0, 0],
      [1, 1, 1],
    ]
  ) {
    return new Box({
      points,
    });
  }

  quads: Record<VoxelFaces, Quad> = [
    Quad.Create(),
    Quad.Create(),
    Quad.Create(),
    Quad.Create(),
    Quad.Create(),
    Quad.Create(),
  ];

  constructor(data: { points?: BoxPoints }) {
    if (data.points) this.setPoints(data.points);
  }

  setPoints(points: BoxPoints) {
    const [startX, startY, startZ] = points[0];
    const [endX, endY, endZ] = points[1];

    this.quads[VoxelFaces.Up].setPositions([
      [endX, endY, endZ],
      [startX, endY, endZ],
      [startX, endY, startZ],
      [endX, endY, startZ],
    ]);

    this.quads[VoxelFaces.Down].setPositions([
      [startX, startY, endZ],
      [endX, startY, endZ],
      [endX, startY, startZ],
      [startX, startY, startZ],
    ]);

    this.quads[VoxelFaces.North].setPositions([
      [startX, endY, endZ],
      [endX, endY, endZ],
      [endX, startY, endZ],
      [startX, startY, endZ],
    ]);

    this.quads[VoxelFaces.South].setPositions([
      [endX, endY, startZ],
      [startX, endY, startZ],
      [startX, startY, startZ],
      [endX, startY, startZ],
    ]);

    this.quads[VoxelFaces.East].setPositions([
      [endX, endY, endZ],
      [endX, endY, startZ],
      [endX, startY, startZ],
      [endX, startY, endZ],
    ]);

    this.quads[VoxelFaces.West].setPositions([
      [startX, endY, startZ],
      [startX, endY, endZ],
      [startX, startY, endZ],
      [startX, startY, startZ],
    ]);
  }
}
