import { CompiledQuadVoxelGeometryNode } from "./QuadVoxelGeometryNodeTypes";
import { CompiledTriangleVoxelGeometryNode } from "./TriangleVoxelGeometryNodeTypes";

export type CompiledCustomGeometryNode = {
  type: "custom";
  id: string;
};
export type CompiledGeometryNodes =
  | CompiledQuadVoxelGeometryNode
  | CompiledTriangleVoxelGeometryNode
  | CompiledCustomGeometryNode;
