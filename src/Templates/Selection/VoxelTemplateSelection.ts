import { Vector3Like } from "@amodx/math";
import { IVoxelSelection, IVoxelSelectionData } from "./VoxelSelection";
import { IVoxelTemplate, IVoxelTemplateData } from "../VoxelTemplates.types";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";
import type { VoxelTemplateRegister } from "../VoxelTemplateRegister";

export interface VoxelTemplateSelectionData
  extends IVoxelSelectionData<"template"> {
  template: IVoxelTemplateData<any>;
}

export class VoxelTemplateSelection implements IVoxelSelection<"template"> {
  static Register: typeof VoxelTemplateRegister;
  origin = Vector3Like.Create();
  bounds = new BoundingBox();
  template: IVoxelTemplate;

  isSelected(x: number, y: number, z: number): boolean {
    if (!this.bounds.intersectsXYZ(x + 0.5, y + 0.5, z + 0.5)) return false;
    const rx = x - this.origin.x;
    const ry = y - this.origin.y;
    const rz = z - this.origin.z;
    if (!this.template.isIncluded(this.template.getIndex(rx, ry, rz)))
      return false;

    return true;
  }

  clone() {
    const newSelection = new VoxelTemplateSelection();
    Vector3Like.Copy(newSelection.origin, this.origin);
    newSelection.bounds.setMinMax(this.bounds.min, this.bounds.max);
    newSelection.template = this.template.clone();
    return newSelection;
  }

  setTemplate(template: IVoxelTemplate) {
    this.template = template;
    this.bounds.setMinMax(
      this.origin,
      Vector3Like.Add(this.origin, template.bounds.size)
    );
  }

  toJSON(): VoxelTemplateSelectionData {
    return {
      type: "template",
      origin: { ...this.origin },
      bounds: { ...this.bounds.size },
      template: this.template.toJSON(),
    };
  }

  fromJSON(data: VoxelTemplateSelectionData) {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;
    const template = VoxelTemplateSelection.Register.create(data.template);
    this.setTemplate(template);
  }
}
