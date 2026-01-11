import {  Vec3Array } from "@amodx/math";
import {
  VoxelModelRelationsSchemaNodes,
  VoxelBinaryStateSchemaNode,
} from "../../Voxels/State/State.types";
import { VoxelEffectData } from "../../Voxels/Effects/VoxelEffects.types";
import { VoxelBaseProperties } from "../Types/Voxel.types";

import {
  CullingProcedureData,
  VoxelGeometryTextureArgument,
  VoxelGeometryBoxUVArgument,
  VoxelGeometryVector3Argument,
  VoxelGeometryIntArgument,
  VoxelGeometryBooleanArgument,
  VoxelGeometryFloatArgument,
} from "../Geometry/VoxelGeometry.types";

export interface VoxelGeometryLinkData {
  //  id: string;
  geometryId: string;
  /**
   * Overrride the culling procedure for faces
   */
  cullingProcedure?: CullingProcedureData;
  /**Divisor used for transform of this specific node.*/
  divisor?: Vec3Array;
  inputs: Record<string, any>;
  scale?: Vec3Array;
  position?: Vec3Array;
  rotation?: Vec3Array;
  rotationPivot?: Vec3Array;
  flip?: [flipX: 0 | 1, flipY: 0 | 1, flipZ: 0 | 1];
}

export interface VoxelModelData {
  id: string;
  /**Divisor used all transforms of geometry nodes. */
  divisor?: Vec3Array;
  arguments: Record<
    string,
    | VoxelGeometryTextureArgument
    | VoxelGeometryBoxUVArgument
    | VoxelGeometryVector3Argument
    | VoxelGeometryIntArgument
    | VoxelGeometryBooleanArgument
    | VoxelGeometryFloatArgument
  >;
  stateSchema: VoxelBinaryStateSchemaNode[];
  /**Define default properties for the voxel. */
  properties?: Partial<VoxelBaseProperties>;
  effects?: VoxelEffectData[];
  relationsSchema: VoxelModelRelationsSchemaNodes[];
  stateNodes: Record<string, VoxelGeometryLinkData[]>;
  conditonalNodes: Record<string, VoxelGeometryLinkData[]>;
}

/**The model data assoicated with the actual voxel. */
export interface VoxelModelConstructorData {
  id: string;
  modRelationSchema?: VoxelModelRelationsSchemaNodes[];
  modSchema?: VoxelBinaryStateSchemaNode[];
  inputs: Record<string, Record<string, any>>;
}
