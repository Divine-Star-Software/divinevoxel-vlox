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
  reltioanlState: [key: string, VoxelBinaryStateSchemaNode[]][];
  reltionalStateBuilder: [key: string, VoxelModelRelationsSchemaNodes[]][];
  reltioanlMod: [key: string, VoxelBinaryStateSchemaNode[]][];
  reltionalModBuilder: [key: string, VoxelModelRelationsSchemaNodes[]][];
};

export class VoxelSchemas {
  //maps voxel model ids to the their state scehma
  static state = new Map<string, BinarySchema>();
  //maps voxel ids to their mod schemao
  static mod = new Map<string, BinarySchema>();
  //maps voxel model ids to their reltional state schema
  static reltioanlState = new Map<string, BinarySchema>();
  //maps voxel model ids = their reltional state builder
  static reltionalStateBuilder = new Map<string, ReltionalStateBuilder>();
  //maps voxel ids to their reltional mod schema
  static reltioanlMod = new Map<string, BinarySchema>();
  //maps voxel ids = their reltional mod builder
  static reltionalModBuilder = new Map<string, ReltionalStateBuilder>();

  static getStateSchema(voxelId: string) {
  const modelId =  VoxelLUT.models.getStringId(
      VoxelLUT.modelsIndex[VoxelLUT.voxelIds.getNumberId(voxelId)]
    );
    return this.state.get(modelId);
  }
  static export(): VoxelSchemasExport {
    return {
      state: [...this.state].map(([key, value]) => [key, value.getSchema()]),
      mod: [...this.mod].map(([key, value]) => [key, value.getSchema()]),
      reltioanlState: [...this.reltioanlState].map(([key, value]) => [
        key,
        value.getSchema(),
      ]),
      reltionalStateBuilder: [...this.reltionalStateBuilder].map(
        ([key, value]) => [key, value.getSchema()]
      ),
      reltioanlMod: [...this.reltioanlMod].map(([key, value]) => [
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
    this.reltioanlState = new Map(
      exported.reltioanlState.map(([key, nodes]) => [
        key,
        new BinarySchema(nodes),
      ])
    );
    this.reltionalStateBuilder = new Map(
      exported.reltionalStateBuilder.map(([key, nodes]) => [
        key,
        new ReltionalStateBuilder(this.reltioanlState.get(key)!, nodes),
      ])
    );
    this.reltioanlMod = new Map(
      exported.reltioanlMod.map(([key, nodes]) => [
        key,
        new BinarySchema(nodes),
      ])
    );
    this.reltionalModBuilder = new Map(
      exported.reltionalModBuilder.map(([key, nodes]) => [
        key,
        new ReltionalStateBuilder(this.reltioanlMod.get(key)!, nodes),
      ])
    );
  }
}
