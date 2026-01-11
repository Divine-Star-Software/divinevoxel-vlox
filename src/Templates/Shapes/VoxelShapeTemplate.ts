import { Flat3DIndex, Vector3Like } from "@amodx/math";
import { PaintVoxelData, RawVoxelData } from "../../Voxels";
import {
  VoxelShapeTemplateData,
  VoxelShapeTemplateFillModes,
} from "./VoxelShapeTemplate.types";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";
import { IVoxelTemplate, IVoxelTemplateData } from "../VoxelTemplates.types";
import {
  IVoxelShapeSelection,
  IVoxelShapeSelectionData,
} from "./Selections/VoxelShapeSelection";
import { BoxVoxelShapeSelection } from "./Selections/BoxVoxelShapeSelection";
import type { VoxelTemplateRegister } from "../VoxelTemplateRegister";
export class VoxelShapeTemplate
  implements IVoxelTemplate<"shape", VoxelShapeTemplateData>
{
  static Register: typeof VoxelTemplateRegister;
  static CreateNew(
    data: Partial<VoxelShapeTemplateData>
  ): VoxelShapeTemplateData {
    return {
      type: "shape",
      bounds: data.bounds ||
        data.shapeSelection?.bounds || { x: 1, y: 1, z: 1 },
      fillMode: data.fillMode || "full",
      fillVoxel: data.fillVoxel || PaintVoxelData.Create(),
      faceVoxel: data.faceVoxel || PaintVoxelData.Create(),
      edgeVoxel: data.edgeVoxel || PaintVoxelData.Create(),
      pointVoxel: data.pointVoxel || PaintVoxelData.Create(),
      shapeSelection:
        data.shapeSelection || BoxVoxelShapeSelection.CreateNew({}),
    };
  }
  index = Flat3DIndex.GetXZYOrder();
  bounds: BoundingBox;

  fillMode: VoxelShapeTemplateFillModes;
  fillVoxel: PaintVoxelData;
  faceVoxel: PaintVoxelData;
  edgeVoxel: PaintVoxelData;
  pointVoxel: PaintVoxelData;
  _fillVoxel: RawVoxelData;
  _faceVoxel: RawVoxelData;
  _edgeVoxel: RawVoxelData;
  _pointVoxel: RawVoxelData;
  shapeSelection: IVoxelShapeSelection<any, IVoxelShapeSelectionData<any>>;

  constructor(data?: VoxelShapeTemplateData) {
    if (data) this.fromJSON(data);
  }

  inBounds(x: number, y: number, z: number): boolean {
    return this.bounds.intersectsXYZ(x + 0.5, y + 0.5, z + 0.5);
  }

  setVoxels(
    fill: PaintVoxelData,
    face?: PaintVoxelData,
    edge?: PaintVoxelData,
    point?: PaintVoxelData
  ): void {
    this.fillVoxel = fill;
    this.faceVoxel = face || fill;
    this.edgeVoxel = edge || fill;
    this.pointVoxel = point || fill;
    this._fillVoxel = PaintVoxelData.ToRaw(this.fillVoxel);
    this._faceVoxel = PaintVoxelData.ToRaw(this.faceVoxel);
    this._edgeVoxel = PaintVoxelData.ToRaw(this.edgeVoxel);
    this._pointVoxel = PaintVoxelData.ToRaw(this.pointVoxel);
  }

  getIndex(x: number, y: number, z: number): number {
    return this.index.getIndexXYZ(x, y, z);
  }

  isIncluded(index: number) {
    const [x, y, z] = this.index.getXYZ(index);
    return this.shapeSelection.isSelected(
      x + this.shapeSelection.origin.x,
      y + this.shapeSelection.origin.y,
      z + this.shapeSelection.origin.z
    );
  }

  isAir(index: number) {
    if (!this.isIncluded(index)) return true;
    return this.getId(index) === 0;
  }

  getId(index: number): number {
    if (!this.isIncluded(index)) return 0;
    const id = this._fillVoxel[0];
    if (this.fillMode == "full") return id;
    return id;
  }

  getLight(index: number): number {
    if (!this.isIncluded(index)) return 0;

    const light = this._fillVoxel[1];
    if (this.fillMode == "full") return light;
    return light;
  }

  getLevel(index: number): number {
    if (!this.isIncluded(index)) return 0;
    const level = this._fillVoxel[2];
    if (this.fillMode == "full") return level;
    return level;
  }

  getSecondary(index: number): number {
    if (!this.isIncluded(index)) return 0;
    const secondary = this._fillVoxel[3];
    if (this.fillMode == "full") return secondary;
    return secondary;
  }

  getRaw(index: number, rawRef: RawVoxelData = [0, 0, 0, 0]): RawVoxelData {
    if (!this.isIncluded(index)) {
      rawRef[0] = 0;
      rawRef[1] = 0;
      rawRef[2] = 0;
      rawRef[3] = 0;
      return rawRef;
    }
    rawRef[0] = this.getId(index);
    rawRef[1] = this.getLight(index);
    rawRef[2] = this.getLevel(index);
    rawRef[3] = this.getSecondary(index);
    return rawRef;
  }

  clone() {
    const newTemplate = new VoxelShapeTemplate();
    newTemplate.fromJSON(this.toJSON());
    return newTemplate;
  }

  toJSON(): VoxelShapeTemplateData {
    return {
      type: "shape",
      bounds: { ...this.bounds.size },
      fillMode: this.fillMode,
      fillVoxel: { ...this.fillVoxel },
      faceVoxel: { ...this.faceVoxel },
      edgeVoxel: { ...this.edgeVoxel },
      pointVoxel: { ...this.pointVoxel },
      shapeSelection: this.shapeSelection.toJSON(),
    };
  }

  fromJSON(data: VoxelShapeTemplateData): void {
    this.fillMode = data.fillMode;
    this.bounds = new BoundingBox();
    this.shapeSelection = VoxelShapeTemplate.Register.createSelection(
      data.shapeSelection
    );
    this.bounds.setSize(this.shapeSelection.bounds.size);
    this.index.setBounds(
      this.bounds.size.x,
      this.bounds.size.y,
      this.bounds.size.z
    );
    this.setVoxels(
      data.fillVoxel,
      data.faceVoxel,
      data.edgeVoxel,
      data.pointVoxel
    );
  }
}
