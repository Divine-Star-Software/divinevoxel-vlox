import { Vector3Like } from "@amodx/math";
import { IVoxelSelection } from "./VoxelSelecton";
import { BoxVoxelTemplate } from "../Shapes/BoxVoxelTemplate";
import { IVoxelshapeTemplateBaseData } from "../Shapes/VoxelShapeTemplate.types";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";

export class VoxelPointSelection implements IVoxelSelection {
  origin = Vector3Like.Create();
  end = Vector3Like.Create();
  size = Vector3Like.Create();
  bounds = new BoundingBox();

  isSelected(x: number, y: number, z: number): boolean {
    if (x < this.origin.x || x >= this.end.x) return false;
    if (y < this.origin.y || y >= this.end.y) return false;
    if (z < this.origin.z || z >= this.end.z) return false;
    return true;
  }

  reConstruct(position: Vector3Like) {
    this.origin.x = position.x;
    this.origin.y = position.y;
    this.origin.z = position.z;
    this.end.x = this.origin.x + 1;
    this.end.y = this.origin.y + 1;
    this.end.z = this.origin.z + 1;
    this.size.x = 1;
    this.size.y = 1;
    this.size.z = 1;
    this.bounds.setMinMax(this.origin, this.end);
  }

  clone() {
    const newSelection = new VoxelPointSelection();
    Vector3Like.Copy(newSelection.origin, this.origin);
    Vector3Like.Copy(newSelection.size, this.size);
    Vector3Like.Copy(newSelection.end, this.end);
    newSelection.bounds.setMinMax(this.bounds.min, this.bounds.max);
    return newSelection;
  }

  toTemplate(data?: Partial<IVoxelshapeTemplateBaseData>) {
    const boxTemplate = BoxVoxelTemplate.CreateNew({
      width: this.size.x,
      height: this.size.y,
      depth: this.size.z,
      ...(data ? data : {}),
    });
    return new BoxVoxelTemplate(boxTemplate);
  }

  toExtrudedTemplate(cursor: DataCursorInterface, normal: Vector3Like) {}
}
