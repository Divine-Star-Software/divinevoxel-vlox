import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { VoxelShapeTemplate } from "../../../Templates/Shapes/VoxelShapeTemplate";
import { SphereVoxelShapeSelection } from "../../../Templates/Shapes/Selections/SphereVoxelShapeSelection";
import { BoxVoxelShapeSelection } from "../../../Templates/Shapes/Selections/BoxVoxelShapeSelection";
import { PyramidVoxelShapeSelection } from "../../../Templates/Shapes/Selections/PyramidVoxelShapeSelection";
import { EllipsoidVoxelShapeSelection } from "../../../Templates/Shapes/Selections/EllipsoidVoxelShapeSelection";

import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { Vector3Like } from "@amodx/math";
import { PaintVoxelData } from "../../../Voxels";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
import { FreePointSelection } from "../../Util/FreePointSelection";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";

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

export enum BrushToolSelectionPositionModes {
  Surface = "Surface",
  Free = "Free",
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
  static PositionTypeModeArray: BrushToolSelectionPositionModes[] = [
    BrushToolSelectionPositionModes.Surface,
    BrushToolSelectionPositionModes.Free,
  ];
  static PositionModeArray: BrushPositionModes[] = [
    BrushPositionModes.Start,
    BrushPositionModes.Center,
    BrushPositionModes.End,
  ];
  static get ShapesArray() {
    return Object.keys(this.ShapeCreators);
  }
  static ShapeCreators: Record<string, () => VoxelShapeTemplate> = {
    Sphere() {
      return new VoxelShapeTemplate(
        VoxelShapeTemplate.CreateNew({
          shapeSelection: SphereVoxelShapeSelection.CreateNew({}),
        }),
      );
    },
    Box() {
      return new VoxelShapeTemplate(
        VoxelShapeTemplate.CreateNew({
          shapeSelection: BoxVoxelShapeSelection.CreateNew({}),
        }),
      );
    },
    Pyramid() {
      return new VoxelShapeTemplate(
        VoxelShapeTemplate.CreateNew({
          shapeSelection: PyramidVoxelShapeSelection.CreateNew({}),
        }),
      );
    },
    Ellipsoid() {
      return new VoxelShapeTemplate(
        VoxelShapeTemplate.CreateNew({
          shapeSelection: EllipsoidVoxelShapeSelection.CreateNew({}),
        }),
      );
    },
  };
  static BaseToolOptions: ToolOptionsData = [
    {
      cateogry: "main",
      property: "axisXPositionMode",
      name: "X Axis Position Mode",
      type: "string",
      options: [
        ["End", BrushPositionModes.End],
        ["Center", BrushPositionModes.Center],
        ["Start", BrushPositionModes.Start],
      ],
    },
    {
      cateogry: "main",
      property: "axisYPositionMode",
      name: "Y Axis Position Mode",
      type: "string",
      options: [
        ["End", BrushPositionModes.End],
        ["Center", BrushPositionModes.Center],
        ["Start", BrushPositionModes.Start],
      ],
    },
    {
      cateogry: "main",
      property: "axisZPositionMode",
      name: "Z Axis Position Mode",
      type: "string",
      options: [
        ["End", BrushPositionModes.End],
        ["Center", BrushPositionModes.Center],
        ["Start", BrushPositionModes.Start],
      ],
    },
  ];
  static ShapeOptions: Record<string, () => ToolOptionsData> = {
    Sphere() {
      return [
        {
          cateogry: "shape",
          property: "radius",
          name: "Radius",
          type: "number",
          min: 0,
          max: 50,
        },
      ];
    },
    Box() {
      return [
        {
          cateogry: "shape",
          property: "width",
          name: "Width",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          cateogry: "shape",
          property: "height",
          name: "Height",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          cateogry: "shape",
          property: "depth",
          name: "Depth",
          type: "number",
          min: 0,
          max: 50,
        },
      ];
    },
    Pyramid() {
      return [
        {
          cateogry: "shape",
          property: "direction",
          name: "Direction",
          type: "string",
          options: [
            ["Up", "+y"],
            ["Down", "-y"],
            ["East", "+x"],
            ["West", "-x"],
            ["North", "+z"],
            ["South", "-z"],
          ],
        },
        {
          cateogry: "shape",
          property: "height",
          name: "Height",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          cateogry: "shape",
          property: "fallOff",
          name: "Falloff",
          type: "number",
          min: 0,
          max: 50,
        },
      ];
    },
    Ellipsoid() {
      return [
        {
          cateogry: "shape",
          property: "radiusX",
          name: "Radius X",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          cateogry: "shape",
          property: "radiusY",
          name: "Radius Y",
          type: "number",
          min: 0,
          max: 50,
        },
        {
          cateogry: "shape",
          property: "radiusZ",
          name: "Radius Z",
          type: "number",
          min: 0,
          max: 50,
        },
      ];
    },
  };
  shape = "Sphere";
  axisXPositionMode = BrushPositionModes.Center;
  axisYPositionMode = BrushPositionModes.Center;
  axisZPositionMode = BrushPositionModes.Center;
  mode = BrushToolModes.Fill;
  positionMode = BrushToolSelectionPositionModes.Surface;
  private pointSelection = new VoxelPointSelection();
  freeSelection = new FreePointSelection(this.space, this.pointSelection);
  get distance() {
    return this.freeSelection.distance;
  }

  set distance(distance: number) {
    this.freeSelection.distance = distance;
  }

  template: VoxelShapeTemplate;
  get selection() {
    return this.template.shapeSelection;
  }
  voxelData: Partial<BrushVoxelData> = {};
  usePlacingStrategy = true;
  placePosition = Vector3Like.Create();
  protected _position = Vector3Like.Create();
  constructor(space: VoxelBuildSpace) {
    super(space);
    this.updateShape(this.shape);
  }

  async update() {
    let place: Vector3Like | null = null;
    if (this.positionMode == BrushToolSelectionPositionModes.Surface) {
      this._lastPicked = await this.space.pickWithProvider(
        this.rayProviderIndex,
      );
      if (!this._lastPicked) return;
      if (
        this.mode == BrushToolModes.Fill ||
        this.mode == BrushToolModes.Extrude
      ) {
        if (
          !this.space.bounds.intersectsPoint(this._lastPicked.normalPosition)
        ) {
          this._lastPicked = null;
          return;
        }
      }
      if (this.mode == BrushToolModes.Remove) {
        if (!this.space.bounds.intersectsPoint(this._lastPicked.position)) {
          this._lastPicked = null;
          return;
        }
      }
      place = this.getPlacePosition(this._lastPicked.normalPosition);
    }
    if (this.positionMode == BrushToolSelectionPositionModes.Free) {
      this.freeSelection.update();
      place = this.getPlacePosition(this.pointSelection.origin);
    }
    if (!place) return;
    this.placePosition.x = place.x;
    this.placePosition.y = place.y;
    this.placePosition.z = place.z;
    this.selection.origin.x = place.x;
    this.selection.origin.y = place.y;
    this.selection.origin.z = place.z;
  }

  cancel(): void {
    this._lastPicked = null;
  }

  async use() {
    if (!this._lastPicked) return;
    if (this.usePlacingStrategy) {
      if (this.voxelData.fill) {
        const newData = this.space.getPlaceState(
          this.voxelData.fill,
          this._lastPicked,
        );
        if (newData) this.voxelData.fill = newData;
      }
    }
    const place = this.placePosition;
    if (this.mode == BrushToolModes.Fill && this.voxelData.fill) {
      this.template.setVoxels(this.voxelData.fill);
      await this.space.paintTemplate(
        [place.x, place.y, place.z],
        this.template.toJSON(),
      );
      return;
    }

    if (this.mode == BrushToolModes.Extrude) {
      const template = await this.space.getExtrudedSelectionTemplate(
        this.selection.toJSON(),
        this._lastPicked.normal,
      );
      await this.space.paintTemplate(this.selection.origin, template.toJSON());
      return;
    }

    if (this.mode == BrushToolModes.Remove) {
      const voxel = this._lastPicked.voxel;
      if (voxel && !voxel.isAir()) {
        await this.space.eraseTemplate(
          [place.x, place.y, place.z],
          this.template.toJSON(),
        );
      }
      return;
    }
  }

  protected getPlacePosition(position: Vector3Like) {
    //x

    if (this.axisXPositionMode == BrushPositionModes.Center) {
      this._position.x =
        position.x - Math.floor(this.template.shapeSelection.bounds.size.x / 2);
    }
    if (this.axisXPositionMode == BrushPositionModes.Start) {
      this._position.x = position.x;
    }
    if (this.axisXPositionMode == BrushPositionModes.End) {
      this._position.x =
        position.x - this.template.shapeSelection.bounds.size.x;
    }
    //y
    if (this.axisYPositionMode == BrushPositionModes.Center) {
      this._position.y =
        position.y - Math.floor(this.template.shapeSelection.bounds.size.y / 2);
    }
    if (this.axisYPositionMode == BrushPositionModes.Start) {
      this._position.y = position.y;
    }
    if (this.axisYPositionMode == BrushPositionModes.End) {
      this._position.y =
        position.y - this.template.shapeSelection.bounds.size.y;
    }
    //z
    if (this.axisZPositionMode == BrushPositionModes.Center) {
      this._position.z =
        position.z - Math.floor(this.template.shapeSelection.bounds.size.z / 2);
    }
    if (this.axisZPositionMode == BrushPositionModes.Start) {
      this._position.z = position.z;
    }
    if (this.axisXPositionMode == BrushPositionModes.End) {
      this._position.z =
        position.z - this.template.shapeSelection.bounds.size.z;
    }

    return this._position;
  }

  updateShape(shape: string) {
    const shapeCreator = BrushTool.ShapeCreators[shape];
    if (!shapeCreator) throw new Error(`Shape with id ${shape} does not exist`);
    this.shape = shape;
    this.template = shapeCreator();
  }

  getOptionValue(property: string) {
    const data = this.getOptionData(property);
    if (!data) return;
    if (this.optionInCategory(property, "main")) {
      return (this as any)[data.property];
    }
    if (this.optionInCategory(property, "shape")) {
      return (this.selection as any)[data.property];
    }
  }

  getCurrentOptions(): ToolOptionsData {
    const options = [
      ...BrushTool.BaseToolOptions,
      ...BrushTool.ShapeOptions[this.shape](),
    ];
    this.processOptions(options);
    return options;
  }

  updateOption(property: string, value: any): void {
    const data = this.getOptionData(property);
    if (!data) return;
    if (this.optionInCategory(property, "main")) {
      (this as any)[data.property] = value;
      return;
    }
    if (this.optionInCategory(property, "shape")) {
      (this.selection as any)[data.property] = value;
      return;
    }
  }
}
