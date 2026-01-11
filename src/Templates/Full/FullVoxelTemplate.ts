import { Flat3DIndex, Vec3Array, Vector3Like } from "@amodx/math";
import { IVoxelTemplate } from "../VoxelTemplates.types";
import { FullVoxelTemplateData } from "./FullVoxelTemplate.types";
import { RawVoxelData } from "../../Voxels/Types/Voxel.types";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { getBitArrayIndex } from "../../Util/Binary/BinaryArrays";
import { EngineSettings } from "../../Settings/EngineSettings";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

const point = Vector3Like.Create();
export class FullVoxelTemplate implements IVoxelTemplate<"full"> {
  static CreateNew(
    bounds: Vec3Array,
    baseLightValue = 0
  ): FullVoxelTemplateData {
    const voxelSize = bounds[0] * bounds[1] * bounds[2];
    const bufferSize = //ids
      voxelSize * 2 +
      //light
      voxelSize * 2 +
      //secondary
      voxelSize * 2 +
      //level
      voxelSize;
    const sectionBuffer = EngineSettings.settings.memoryAndCPU.useSharedMemory
      ? new SharedArrayBuffer(bufferSize)
      : new ArrayBuffer(bufferSize);

    let bufferStart = 0;

    const ids = new Uint16Array(sectionBuffer, bufferStart, voxelSize);
    bufferStart += voxelSize * 2;
    const light = new Uint16Array(sectionBuffer, bufferStart, voxelSize);
    bufferStart += voxelSize * 2;
    if (baseLightValue) light.fill(baseLightValue);
    const secondary = new Uint16Array(sectionBuffer, bufferStart, voxelSize);
    bufferStart += voxelSize * 2;

    const level = new Uint8Array(sectionBuffer, bufferStart, voxelSize);
    bufferStart += voxelSize;
    return {
      type: "full",
      bounds: Vector3Like.Create(...bounds),
      ids,
      light,
      level,
      secondary,
    };
  }

  index = Flat3DIndex.GetXZYOrder();
  bounds: BoundingBox;
  ids: Uint16Array;
  level: Uint8Array;
  light: Uint16Array;
  secondary: Uint16Array;

  mask?: Uint8Array;

  constructor(data: FullVoxelTemplateData) {
    this.fromJSON(data);
  }

  inBounds(x: number, y: number, z: number): boolean {
    point.x = x + 0.5;
    point.y = y + 0.5;
    point.z = z + 0.5;
    return this.bounds.intersectsPoint(point);
  }


  isAir(index: number) {
    return this.ids[index] === 0;
  }

  isIncluded(index: number) {
    if (index < 0 || index >= this.index.size) return false;
    if (this.mask) {
      return getBitArrayIndex(this.mask, index) === 1;
    }
    return true;
  }

  getIndex(x: number, y: number, z: number): number {
    return this.index.getIndexXYZ(x, y, z);
  }

  getId(index: number): number {
    return this.ids[index];
  }

  getLight(index: number): number {
    return this.light[index];
  }

  getLevel(index: number): number {
    return this.level[index];
  }

  getSecondary(index: number): number {
    return this.secondary[index];
  }

  getRaw(index: number, rawRef: RawVoxelData = [0, 0, 0, 0]): RawVoxelData {
    rawRef[0] = this.getId(index);
    rawRef[1] = this.getLight(index);
    rawRef[2] = this.getLevel(index);
    rawRef[3] = this.getSecondary(index);
    return rawRef;
  }

  clone() {
    const newTemplate = new FullVoxelTemplate({
      type: "full",
      bounds: { ...this.bounds.size },
      ids: this.ids.slice(),
      light: this.light.slice(),
      level: this.level.slice(),
      secondary: this.secondary.slice(),
      ...(this.mask ? { mask: this.mask.slice() } : {}),
    });
    return newTemplate;
  }

  toJSON(): FullVoxelTemplateData {
    return {
      type: "full",
      bounds: this.bounds.size,
      ids: this.ids,
      light: this.light,
      level: this.level,
      secondary: this.secondary,
      ...(this.mask ? { mask: this.mask } : {}),
    };
  }

  fromJSON(data: FullVoxelTemplateData): void {
    this.bounds = new BoundingBox();
    this.bounds.setSize(data.bounds);
    this.index.setBounds(data.bounds.x, data.bounds.y, data.bounds.z);
    this.ids = data.ids;
    this.level = data.level;
    this.light = data.light;
    this.secondary = data.secondary;
    if (data.mask) this.mask = data.mask;
  }
}
