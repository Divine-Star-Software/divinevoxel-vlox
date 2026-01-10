import { Vec3Array } from "@amodx/math";

/**
 * Binary State
 */
export type VoxelBinaryStateSchemaNode = {
  name: string;
  bitIndex: number;
  bitSize: number;
  values?: string[];
};

/**
 * Relational
 */
export interface SameVoxelRelationsConditionData {
  type: "same-voxel";
  direction: Vec3Array;
}

export interface AnyVoxelRelationsConditionData {
  type: "any-voxel";
  direction: Vec3Array;
}

export type VoxelStateRelationsConditionData =
  | SameVoxelRelationsConditionData
  | AnyVoxelRelationsConditionData;

export interface VoxelModelRelationsSchemaNodes {
  name: string;
  conditions: VoxelStateRelationsConditionData[];
}


