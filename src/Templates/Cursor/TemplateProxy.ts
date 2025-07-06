import { Vector3Like } from "@amodx/math";
import { IVoxelTemplate } from "../../Templates/VoxelTemplates.types";
import { NumberArray } from "../../Util/Util.types";

const point = Vector3Like.Create();
export class TemplateProxy {
  ids: NumberArray;
  levels: NumberArray;
  secondary: NumberArray;
  light: NumberArray;
  constructor(public template: IVoxelTemplate) {
    this.ids = new Proxy([], {
      get: (_, index) => this.template.getId(Number(index)),
    });
    this.light = new Proxy([], {
      get: (_, index) => this.template.getLight(Number(index)),
    });
    this.levels = new Proxy([], {
      get: (_, index) => this.template.getLevel(Number(index)),
    });
    this.secondary = new Proxy([], {
      get: (_, index) => this.template.getSecondary(Number(index)),
    });
  }

  inBounds(x: number, y: number, z: number): boolean {
    point.x = x;
    point.y = y;
    point.z = z;
    const inBounds = this.template.bounds.intersectsPoint(point);
    if (!inBounds) return false;
    const index = this.template.getIndex(x, y, z);
    if (!this.template.isIncluded(index)) return false;
    return true;
  }
}
