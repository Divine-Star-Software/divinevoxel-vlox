import { Vector3Like } from "@amodx/math";
import { IVoxelSelection, IVoxelSelectionData } from "./VoxelSelection";
import { VoxelShapeTemplate } from "../Shapes/VoxelShapeTemplate";
import { BoxVoxelShapeSelection } from "../Shapes/Selections/BoxVoxelShapeSelection";
import { IVoxelshapeTemplateBaseData } from "../Shapes/VoxelShapeTemplate.types";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";

export interface VoxelPointSelectionData extends IVoxelSelectionData<"point"> {}

export class VoxelPointSelection
  implements IVoxelSelection<"point", VoxelPointSelectionData>
{
  origin = Vector3Like.Create();
  bounds = new BoundingBox();

  isSelected(x: number, y: number, z: number): boolean {
    if (!this.bounds.intersectsXYZ(x + 0.5, y + 0.5, z + 0.5)) return false;
    return true;
  }

  reConstruct(position: Vector3Like) {
    this.origin.x = position.x;
    this.origin.y = position.y;
    this.origin.z = position.z;
    this.bounds.setMinMax(this.origin, Vector3Like.AddScalar(this.origin, 1));
  }

  clone() {
    const newSelection = new VoxelPointSelection();
    Vector3Like.Copy(newSelection.origin, this.origin);
    newSelection.bounds.setMinMax(this.bounds.min, this.bounds.max);
    return newSelection;
  }

  toTemplate(data?: Partial<IVoxelshapeTemplateBaseData>) {
    return new VoxelShapeTemplate(
      VoxelShapeTemplate.CreateNew({
        shapeSelection: BoxVoxelShapeSelection.CreateNew({}),
        ...data,
      })
    );
  }

  toExtrudedTemplate(cursor: DataCursorInterface, normal: Vector3Like) {}

  toJSON(): VoxelPointSelectionData {
    return {
      type: "point",
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
    };
  }

  fromJSON(data: any): void {
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
