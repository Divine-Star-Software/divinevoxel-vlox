import { CompiledQuadVoxelGeometryNode } from "./QuadVoxelGometryNodeTypes";
import { CompiledTriangleVoxelGeometryNode } from "./TriangleVoxelGometryNodeTypes";

export type CompiledCustomGeometryNode = {
  type: "custom";
  id: string;
};
export type CompiledGeometryNodes =
  | CompiledQuadVoxelGeometryNode
  | CompiledTriangleVoxelGeometryNode
  | CompiledCustomGeometryNode;
