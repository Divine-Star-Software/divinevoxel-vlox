import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { BasicVoxelShapeTemplate } from "../../../Templates/Shapes/BasicVoxelShapeTemplate";
import { VoxelTemplateSelection } from "../../../Templates/Selection/VoxelTemplateSelection";
import { SphereVoxelTemplate } from "../../../Templates/Shapes/SphereVoxelTemplate";
import { BoxVoxelTemplate } from "../../../Templates/Shapes/BoxVoxelTemplate";
import { PyramidVoxelTemplate } from "../../../Templates/Shapes/PyramidVoxelTemplate";
import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { Vector3Like } from "@amodx/math";
import { PaintVoxelData } from "../../../Voxels";
import { BuilderToolBase } from "../BuilderToolBase";
import { EllipsoidVoxelTemplate } from "../../../Templates/Shapes/EllipsoidVoxelTemplate";

export enum BrushPositionModes {
  Start = "Start",
  Center = "Center",
  End = "End",
}

export enum BrushToolModes {
  Fill = "Fill",
  Extrude = "Extrude",
  Remove = "Remove",
}

type BrushVoxelData = {
  fill: PaintVoxelData;
  face: PaintVoxelData;
  edge: PaintVoxelData;
  point: PaintVoxelData;
};

interface BrushToolEvents {
  "shape-updated": null;
}
export class BrushTool extends BuilderToolBase<BrushToolEvents> {
  static ToolId = "Brush";
  static ModeArray: BrushToolModes[] = [
    BrushToolModes.Fill,
    BrushToolModes.Extrude,
    BrushToolModes.Remove,
  ];
  static PositionModeArray: BrushPositionModes[] = [
    BrushPositionModes.Start,
    BrushPositionModes.Center,
    BrushPositionModes.End,
  ];
  static get ShapesArray() {
    return Object.keys(this.ShapeCreators);
  }
  static ShapeCreators: Record<
    string,
    () => BasicVoxelShapeTemplate<any, any, any>
  > = {
    Sphere: () => {
      return new SphereVoxelTemplate(SphereVoxelTemplate.CreateNew({}));
    },
    Box: () => {
      return new BoxVoxelTemplate(BoxVoxelTemplate.CreateNew({}));
    },
    Pyramid: () => {
      return new PyramidVoxelTemplate(PyramidVoxelTemplate.CreateNew({}));
    },
    Ellipsoid: () => {
      return new EllipsoidVoxelTemplate(EllipsoidVoxelTemplate.CreateNew({}));
    },
  };
  shape = "Sphere";
  axisXPositionMode = BrushPositionModes.Center;
  axisYPositionMode = BrushPositionModes.Center;
  axisZPositionMode = BrushPositionModes.Center;
  mode = BrushToolModes.Fill;

  template: BasicVoxelShapeTemplate<any, any, any>;
  selection: VoxelTemplateSelection;
  protected _position = Vector3Like.Create();
  constructor(public space: VoxelBuildSpace) {
    super();
    this.selection = new VoxelTemplateSelection();
    this.updateShape(this.shape);
  }

  async use(
    picked: VoxelPickResult,
    voxelData: Partial<BrushVoxelData> = {},
    usePlacingStrategy = true
  ) {
    if (usePlacingStrategy) {
      if (voxelData.fill) {
        const newData = this.space.getPlaceState(voxelData.fill, picked);
        if (newData) voxelData.fill = newData;
      }
    }
    if (this.mode == BrushToolModes.Fill && voxelData.fill) {
      if (!this.space.bounds.intersectsPoint(picked.normalPosition)) return;

      this.template.setVoxels(voxelData.fill);
      const place = this.getPlacePosition(picked);
      await this.space.paintTemplate(
        [place.x, place.y, place.z],
        this.template.toJSON()
      );
    }

    if (this.mode == BrushToolModes.Remove) {
      if (!this.space.bounds.intersectsPoint(picked.position)) return;
      const voxel = picked.voxel;
      if (voxel && !voxel.isAir()) {
        const place = this.getPlacePosition(picked);
        await this.space.eraseTemplate(
          [place.x, place.y, place.z],
          this.template.toJSON()
        );
      }
      return true;
    }
  }

  protected getPlacePosition(picked: VoxelPickResult) {
    //x

    if (this.axisXPositionMode == BrushPositionModes.Center) {
      this._position.x =
        picked.normalPosition.x - Math.floor(this.template.bounds.size.x / 2);
    }
    if (this.axisXPositionMode == BrushPositionModes.Start) {
      this._position.x = picked.normalPosition.x;
    }
    if (this.axisXPositionMode == BrushPositionModes.End) {
      this._position.x = picked.normalPosition.x - this.template.bounds.size.x;
    }
    //y
    if (this.axisYPositionMode == BrushPositionModes.Center) {
      this._position.y =
        picked.normalPosition.y - Math.floor(this.template.bounds.size.y / 2);
    }
    if (this.axisYPositionMode == BrushPositionModes.Start) {
      this._position.y = picked.normalPosition.y;
    }
    if (this.axisYPositionMode == BrushPositionModes.End) {
      this._position.y = picked.normalPosition.y - this.template.bounds.size.y;
    }
    //z
    if (this.axisZPositionMode == BrushPositionModes.Center) {
      this._position.z =
        picked.normalPosition.z - Math.floor(this.template.bounds.size.z / 2);
    }
    if (this.axisZPositionMode == BrushPositionModes.Start) {
      this._position.z = picked.normalPosition.z;
    }
    if (this.axisXPositionMode == BrushPositionModes.End) {
      this._position.z = picked.normalPosition.z - this.template.bounds.size.z;
    }

    return this._position;
  }

  updatePlacer(picked: VoxelPickResult) {
    const place = this.getPlacePosition(picked);
    if (!this.space.bounds.intersectsPoint(place)) return false;
    this.selection.origin.x = place.x;
    this.selection.origin.y = place.y;
    this.selection.origin.z = place.z;
  }

  updateShape(shape: string) {
    const shapeCreator = BrushTool.ShapeCreators[shape];
    if (!shapeCreator) throw new Error(`Shape with id ${shape} does not exist`);
    this.shape = shape;
    this.template = shapeCreator();
    this.selection.setTemplate(this.template);
    this.template.addEventListener("updated", () => {
      this.selection.setTemplate(this.template);
      this.dispatch("shape-updated", null);
    });
  }
}
