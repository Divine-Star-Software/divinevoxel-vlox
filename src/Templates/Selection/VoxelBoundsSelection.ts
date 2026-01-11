import { Vec3Array, Vec3ArrayLike, Vector3Like } from "@amodx/math";
import { IVoxelSelection, IVoxelSelectionData } from "./VoxelSelection";
import { VoxelShapeTemplate } from "../Shapes/VoxelShapeTemplate";
import { BoxVoxelShapeSelection } from "../Shapes/Selections/BoxVoxelShapeSelection";
import { IVoxelshapeTemplateBaseData } from "../Shapes/VoxelShapeTemplate.types";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";
const getMinMax = (...points: Vec3Array[]): [Vec3Array, Vec3Array] => {
  if (points.length === 0) {
    throw new Error("At least one point is required to calculate min/max.");
  }

  let min: Vec3Array = [...points[0]];
  let max: Vec3Array = [...points[0]];

  for (const point of points) {
    for (let i = 0; i < 3; i++) {
      if (point[i] < min[i]) {
        min[i] = point[i];
      }
      if (point[i] > max[i]) {
        max[i] = point[i];
      }
    }
  }

  return [min, max];
};

const getSize = (start: Vector3Like, end: Vector3Like) => {
  return Vector3Like.Create(end.x - start.x, end.y - start.y, end.z - start.z);
};

export interface VoxelBoundsSelectionData
  extends IVoxelSelectionData<"bounds"> {}

export class VoxelBoundsSelection
  implements IVoxelSelection<"bounds", VoxelBoundsSelectionData>
{
  origin = Vector3Like.Create();
  end = Vector3Like.Create();
  bounds = new BoundingBox();

  isSelected(x: number, y: number, z: number): boolean {
    if (!this.bounds.intersectsXYZ(x + 0.5, y + 0.5, z + 0.5)) return false;
    return true;
  }

  reConstruct(
    startPosition: Vector3Like,
    startNormal: Vector3Like,
    endPosition: Vector3Like,
    endNormal: Vector3Like,
    offset = 0
  ) {
    const size = getSize(startPosition, endPosition);

    const point1: Vec3Array = [
      startPosition.x,
      startPosition.y,
      startPosition.z,
    ];

    const point2 = Vec3ArrayLike.Add(point1, [
      size.x || 1,
      size.y || 1,
      size.z || 1,
    ]);
    const minPoint: Vec3Array = [
      Math.min(point1[0], point2[0]),
      Math.min(point1[1], point2[1]),
      Math.min(point1[2], point2[2]),
    ];
    const maxPoint: Vec3Array = [
      Math.max(point1[0], point2[0]),
      Math.max(point1[1], point2[1]),
      Math.max(point1[2], point2[2]),
    ];

    if (size.x < 0) maxPoint[0] += 1;
    if (size.y < 0) maxPoint[1] += 1;
    if (size.z < 0) maxPoint[2] += 1;

    const normalOffset = Vec3ArrayLike.Add(
      [startPosition.x, startPosition.y, startPosition.z],
      Vec3ArrayLike.MultiplyScalar(
        [startNormal.x, startNormal.y, startNormal.z],
        offset
      )
    );

    const [finalMin, finalMax] = getMinMax(minPoint, maxPoint, normalOffset);

    const finalSize: Vec3Array = [
      Math.abs(finalMax[0] - finalMin[0]),
      Math.abs(finalMax[1] - finalMin[1]),
      Math.abs(finalMax[2] - finalMin[2]),
    ];
    if (finalSize[0] == 0 && finalSize[1] == 0 && finalSize[2] == 0) {
      this.origin.x = startPosition.x;
      this.origin.y = startPosition.y;
      this.origin.z = startPosition.z;
      this.end.x = startPosition.x + startNormal.x;
      this.end.y = startPosition.y + startNormal.y;
      this.end.z = startPosition.z + startNormal.z;
    } else {
      this.origin.x = finalMin[0];
      this.origin.y = finalMin[1];
      this.origin.z = finalMin[2];
      this.end.x = finalMax[0];
      this.end.y = finalMax[1];
      this.end.z = finalMax[2];
    }
    this.bounds.setMinMax(this.origin, this.end);
  }

  clone() {
    const newSelection = new VoxelBoundsSelection();
    Vector3Like.Copy(newSelection.origin, this.origin);
    Vector3Like.Copy(newSelection.end, this.end);
    newSelection.bounds.setMinMax(this.bounds.min, this.bounds.max);
    return newSelection;
  }

  toTemplate(data?: Partial<IVoxelshapeTemplateBaseData>) {
    return new VoxelShapeTemplate(
      VoxelShapeTemplate.CreateNew({
        shapeSelection: BoxVoxelShapeSelection.CreateNew({
          width: this.bounds.size.x,
          height: this.bounds.size.y,
          depth: this.bounds.size.z,
        }),
        ...(data ? data : {}),
      })
    );
  }

  toExtrudedTemplate(cursor: DataCursorInterface, normal: Vector3Like) {}

  toJSON(): VoxelBoundsSelectionData {
    return {
      type: "bounds",
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
    };
  }

  fromJSON(data: VoxelBoundsSelectionData): void {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;

    this.bounds.setMinMax(this.origin, {
      x: this.origin.x + data.bounds.x,
      y: this.origin.y + data.bounds.y,
      z: this.origin.z + data.bounds.z,
    });
  }
}
