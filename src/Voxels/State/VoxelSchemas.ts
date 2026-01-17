import { VoxelLUT } from "../Data/VoxelLUT";
import { ReltionalStateBuilder } from "./Reltional/ReltionalStateBuilder";
import { BinarySchema } from "./Schema/BinarySchema";
import {
  VoxelBinaryStateSchemaNode,
  VoxelModelRelationsSchemaNodes,
} from "./State.types";

export type VoxelSchemasExport = {
  state: [key: string, VoxelBinaryStateSchemaNode[]][];
  mod: [key: string, VoxelBinaryStateSchemaNode[]][];
  relationalState: [key: string, VoxelBinaryStateSchemaNode[]][];
  reltionalStateBuilder: [key: string, VoxelModelRelationsSchemaNodes[]][];
  relationalMod: [key: string, VoxelBinaryStateSchemaNode[]][];
  reltionalModBuilder: [key: string, VoxelModelRelationsSchemaNodes[]][];
};

export class VoxelSchemas {
  //maps voxel model ids to the their state scehma
  static state = new Map<string, BinarySchema>();
  //maps voxel model number ids to their state schemas
  static stateMap: BinarySchema[] = [];
  //maps voxel ids to their mod schemao
  static mod = new Map<string, BinarySchema>();
  //maps voxel  number ids to their state schemas
  static modMap: BinarySchema[] = [];
  //maps voxel model ids to their reltional state schema
  static relationalState = new Map<string, BinarySchema>();
  //maps voxel model number ids to their reltional state schema
  static relationalStateMap: BinarySchema[] = [];
  //maps voxel model ids = their reltional state builder
  static reltionalStateBuilder = new Map<string, ReltionalStateBuilder>();
  //maps voxel model number ids = their reltional state builder
  static reltionalStateBuilderMap: ReltionalStateBuilder[] = [];
  //maps voxel ids to their reltional mod schema
  static relationalMod = new Map<string, BinarySchema>();
  //maps voxel number ids to their reltional mod schema
  static relationalModMap: BinarySchema[] = [];
  //maps voxel ids to their reltional mod builder
  static reltionalModBuilder = new Map<string, ReltionalStateBuilder>();
  //maps voxel number ids to their reltional mod builder
  static reltionalModBuilderMap: ReltionalStateBuilder[] = [];
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
    for (const [key, schema] of this.reltionalStateBuilder) {
      this.reltionalStateBuilderMap[VoxelLUT.models.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.mod) {
      this.modMap[VoxelLUT.voxelIds.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.relationalMod) {
      this.relationalModMap[VoxelLUT.voxelIds.getNumberId(key)] = schema;
    }
    for (const [key, schema] of this.reltionalModBuilder) {
      this.reltionalModBuilderMap[VoxelLUT.voxelIds.getNumberId(key)] = schema;
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
      reltionalStateBuilder: [...this.reltionalStateBuilder].map(
        ([key, value]) => [key, value.getSchema()]
      ),
      relationalMod: [...this.relationalMod].map(([key, value]) => [
        key,
        value.getSchema(),
      ]),
      reltionalModBuilder: [...this.reltionalModBuilder].map(([key, value]) => [
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
    this.reltionalStateBuilder = new Map(
      exported.reltionalStateBuilder.map(([key, nodes]) => [
        key,
        new ReltionalStateBuilder(this.relationalState.get(key)!, nodes),
      ])
    );
    this.relationalMod = new Map(
      exported.relationalMod.map(([key, nodes]) => [
        key,
        new BinarySchema(nodes),
      ])
    );
    this.reltionalModBuilder = new Map(
      exported.reltionalModBuilder.map(([key, nodes]) => [
        key,
        new ReltionalStateBuilder(this.relationalMod.get(key)!, nodes),
      ])
    );
    this.buildMaps();
  }
}
