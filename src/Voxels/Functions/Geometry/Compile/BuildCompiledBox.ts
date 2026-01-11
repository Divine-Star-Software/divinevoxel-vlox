import { VoxelFaces } from "../../../../Math";
import { VoxelGeometryTransform } from "../../../../Mesher/Geometry/Geometry.types";
import { TransformBox } from "../../../../Mesher/Geometry/Transform/TransformBox";
import { CompiledQuadVoxelGeometryNode } from "Mesher/Voxels/Models/Nodes/Types/QuadVoxelGometryNodeTypes";
import { BuildCompiledQuad } from "./BuildCompiledQuad";
import { VoxelBoxGeometryNode } from "../../../Geometry/VoxelGeometry.types";
import { Box } from "../../../../Mesher/Geometry/Shapes/Box";

export function BuildCompiledBox(
  buildRules: boolean,
  data: VoxelBoxGeometryNode,
  transform: VoxelGeometryTransform
): CompiledQuadVoxelGeometryNode[] {
  const box = Box.Create(data.points);
  TransformBox(box, transform);
  const blankTransform: VoxelGeometryTransform ={};
  const compiled: CompiledQuadVoxelGeometryNode[] = [];
  for (let i = 0 as VoxelFaces; i < 6; i++) {
    compiled.push(
      BuildCompiledQuad(
        buildRules,
        box.quads[i].positions.toVec3Array(),
        blankTransform
      )
    );
  }
  return compiled;
}
