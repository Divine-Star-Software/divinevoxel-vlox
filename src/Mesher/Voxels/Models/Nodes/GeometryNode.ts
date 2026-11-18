import { VoxelModelBuilder } from "../VoxelModelBuilder";
import { VoxelGeometryConstructor } from "./VoxelGeometryConstructor";
export interface GeometryNodeConstructor<Data = any, Args = any> {
  new (
    geometryPaletteId: number,
    geometry: VoxelGeometryConstructor,
    data: Data
  ): GeometryNode<Data, Args>;
}

export abstract class GeometryNode<Data = any, Args = any> {
  builder: VoxelModelBuilder;
  constructor(
    public geometryPaletteId: number,
    public geometry: VoxelGeometryConstructor,
    public data: Data
  ) {}

  abstract init() : void;
  abstract add(args: Args): boolean;
}
