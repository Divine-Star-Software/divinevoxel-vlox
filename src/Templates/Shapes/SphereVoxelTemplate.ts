import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import { IVoxelShapeTemplateData } from "./VoxelShapeTemplate.types";
import { BasicVoxelShapeTemplate } from "./BasicVoxelShapeTemplate";

export interface SphereVoxelTemplateData
  extends IVoxelShapeTemplateData<"sphere-shape"> {
  radius: number;
}

export class SphereVoxelTemplate extends BasicVoxelShapeTemplate<
  "sphere-shape",
  SphereVoxelTemplateData
> {
  static CreateNew(
    data: Partial<SphereVoxelTemplateData>
  ): SphereVoxelTemplateData {
    return {
      ...BasicVoxelShapeTemplate.CreateBaseData("sphere-shape", {
        bounds: {
          x: (data.radius || 1) * 2 + 1,
          y: (data.radius || 1) * 2 + 1,
          z: (data.radius || 1) * 2 + 1,
        },
      }),
      radius: data.radius || 1,
    };
  }
  private _radius = 0;
  get radius() {
    return this._radius;
  }
  set radius(radius: number) {
    const oldRadius = this._radius;
    this._radius = radius;
    this.bounds.size.x = radius * 2 + 1;
    this.bounds.size.y = radius * 2 + 1;
    this.bounds.size.z = radius * 2 + 1;

    if (oldRadius != radius) {
      this._updateBounds();
      this.dispatch("updated", null);
    }
  }

  constructor(data: SphereVoxelTemplateData) {
    super(data);
    this._radius = data.radius;
    this.bounds.size.x = this._radius * 2 + 1;
    this.bounds.size.y = this._radius * 2 + 1;
    this.bounds.size.z = this._radius * 2 + 1;
    this._updateBounds();
  }

  isIncluded(index: number) {
    const [x, y, z] = this.index.getXYZ(index);
    const cx = Math.floor(this.bounds.size.x / 2);
    const cy = Math.floor(this.bounds.size.y / 2);
    const cz = Math.floor(this.bounds.size.z / 2);

    const normX = (x - cx) / this.radius;
    const normY = (y - cy) / this.radius;
    const normZ = (z - cz) / this.radius;
    const distance = Math.sqrt(normX * normX + normY * normY + normZ * normZ);

    return distance <= 1;
  }

  clone() {
    const newTemplate = new SphereVoxelTemplate(structuredClone(this.toJSON()));
    return newTemplate;
  }

  toJSON(): SphereVoxelTemplateData {
    return {
      ...this.getBaseJSON(),
      radius: this.radius,
    };
  }
}
