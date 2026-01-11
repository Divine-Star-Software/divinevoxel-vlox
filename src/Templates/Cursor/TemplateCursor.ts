import { TemplateVoxelCursor } from "./TemplateVoxelCursor";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { IVoxelTemplate } from "../../Templates/VoxelTemplates.types";
import { TemplateProxy } from "./TemplateProxy";
import { VoxelCursor } from "../../Voxels/Cursor/VoxelCursor";
import { RawVoxelData } from "../../Voxels/Types/Voxel.types";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";
const raw: RawVoxelData = [0, 0, 0, 0];
export class TemplateCursor implements DataCursorInterface {
  _voxelIndex = 0;
  _proxy: TemplateProxy | null = null;
  private _airCursor = new VoxelCursor();
  baseLightValue = 0xf;
  private voxel = new TemplateVoxelCursor(this);
  volumeBounds = new BoundingBox();

  constructor() {}

  inBounds(x: number, y: number, z: number): boolean {
    if (!this._proxy) return false;
    return this._proxy.inBounds(x, y, z);
  }
  setTemplate(template: IVoxelTemplate) {
    this._proxy = new TemplateProxy(template);
    this.volumeBounds.setMinMax(template.bounds.min, template.bounds.max);
  }

  getVoxel(x: number, y: number, z: number) {
    if (!this._proxy || !this._proxy.inBounds(x, y, z)) {
      raw[1] = this.baseLightValue;
      this._airCursor.setRaw(raw);
      return this._airCursor as any as TemplateVoxelCursor;
    }
    this._voxelIndex = this._proxy.template.index.getIndexXYZ(x, y, z);
    this.voxel.loadIn();
    return this.voxel;
  }

  clone(): DataCursorInterface {
    return new TemplateCursor();
  }
}
