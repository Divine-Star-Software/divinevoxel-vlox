import { VoxelLUT } from "../Data/VoxelLUT";
import { RelationalStateBuilder } from "./Relational/RelationalStateBuilder";
import { BinarySchema } from "./Schema/BinarySchema";
import {
  VoxelBinaryStateSchemaNode,
  VoxelModelRelationsSchemaNodes,
} from "./State.types";

export type VoxelSchemasExport = {
  state: [key: string, VoxelBinaryStateSchemaNode[]][];
  mod: [key: string, VoxelBinaryStateSchemaNode[]][];
  relationalState: [key: string, VoxelBinaryStateSchemaNode[]][];
  relationalStateBuilder: [key: string, VoxelModelRelationsSchemaNodes[]][];
  relationalMod: [key: string, VoxelBinaryStateSchemaNode[]][];
  relationalModBuilder: [key: string, VoxelModelRelationsSchemaNodes[]][];
};

export class VoxelSchemas {
  //maps voxel model ids to the their state schema
  static state = new Map<string, BinarySchema>();
  //maps voxel model number ids to their state schemas
  static stateMap: BinarySchema[] = [];
  //maps voxel ids to their mod schema
  static mod = new Map<string, BinarySchema>();
  //maps voxel  number ids to their state schemas
  static modMap: BinarySchema[] = [];
  //maps voxel model ids to their relational state schema
  static relationalState = new Map<string, BinarySchema>();
  //maps voxel model number ids to their relational state schema
  static relationalStateMap: BinarySchema[] = [];
  //maps voxel model ids = their relational state builder
  static relationalStateBuilder = new Map<string, RelationalStateBuilder>();
  //maps voxel model number ids = their relational state builder
  static relationalStateBuilderMap: RelationalStateBuilder[] = [];
  //maps voxel ids to their relational mod schema
  static relationalMod = new Map<string, BinarySchema>();
  //maps voxel number ids to their relational mod schema
  static relationalModMap: BinarySchema[] = [];
  //maps voxel ids to their relational mod builder
  static relationalModBuilder = new Map<string, RelationalStateBuilder>();
  //maps voxel number ids to their relational mod builder
  static relationalModBuilderMap: RelationalStateBuilder[] = [];
  static getStateSchema(voxelId: string) {
    const modelId = VoxelLUT.models.getStringId(
      VoxelLUT.modelsIndex[VoxelLUT.voxelIds.getNumberId(voxelId)]
    );
    return this.state.get(modelId);
  }

  static buildMaps() {
    for (const [key, schema] of this.state) {
      this.stateMap[VoxelLUT.models.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.relationalState) {
      this.relationalStateMap[VoxelLUT.models.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.relationalStateBuilder) {
      this.relationalStateBuilderMap[VoxelLUT.models.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.mod) {
      this.modMap[VoxelLUT.voxelIds.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.relationalMod) {
      this.relationalModMap[VoxelLUT.voxelIds.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.relationalModBuilder) {
      this.relationalModBuilderMap[VoxelLUT.voxelIds.getNumberId(key)] = schema;
    }
  }
  static export(): VoxelSchemasExport {
    return {
      state: [...this.state].map(([key, value]) => [key, value.getSchema()]),
      mod: [...this.mod].map(([key, value]) => [key, value.getSchema()]),
      relationalState: [...this.relationalState].map(([key, value]) => [
        key,
        value.getSchema(),
      ]),
      relationalStateBuilder: [...this.relationalStateBuilder].map(
        ([key, value]) => [key, value.getSchema()]
      ),
      relationalMod: [...this.relationalMod].map(([key, value]) => [
        key,
        value.getSchema(),
      ]),
      relationalModBuilder: [...this.relationalModBuilder].map(([key, value]) => [
        key,
        value.getSchema(),
      ]),
    };
  }

  static import(exported: VoxelSchemasExport) {
    this.state = new Map(
      exported.state.map(([key, nodes]) => [key, new BinarySchema(nodes)])
    );
    this.mod = new Map(
      exported.mod.map(([key, nodes]) => [key, new BinarySchema(nodes)])
    );
    this.relationalState = new Map(
      exported.relationalState.map(([key, nodes]) => [
        key,
        new BinarySchema(nodes),
      ])
    );
    this.relationalStateBuilder = new Map(
      exported.relationalStateBuilder.map(([key, nodes]) => [
        key,
        new RelationalStateBuilder(this.relationalState.get(key)!, nodes),
      ])
    );
    this.relationalMod = new Map(
      exported.relationalMod.map(([key, nodes]) => [
        key,
        new BinarySchema(nodes),
      ])
    );
    this.relationalModBuilder = new Map(
      exported.relationalModBuilder.map(([key, nodes]) => [
        key,
        new RelationalStateBuilder(this.relationalMod.get(key)!, nodes),
      ])
    );
    this.buildMaps();
  }
}
