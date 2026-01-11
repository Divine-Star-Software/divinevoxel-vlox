import { QuadVoxelGometryNode } from "./Default/QuadVoxelGeometryNode";
import { TriangleVoxelGeometryNode } from "./Default/TriangleVoxelGeometryNode";
import { GeoemtryNode } from "./GeometryNode";
import { VoxelModelConstructorRegister } from "../VoxelModelConstructorRegister";
import { CullingProcedureData } from "../../../../Voxels/Geometry/VoxelGeometry.types";
import { GeometryLUT } from "../../../../Voxels/Data/GeometryLUT";

export class VoxelGeometryConstructor {
  nodes: GeoemtryNode<any, any>[] = [];
  cullingProcedure: CullingProcedureData;
  constructor(public geometryPaletteId: number) {
    this.cullingProcedure =
      GeometryLUT.geometryCullingProcedures[
        GeometryLUT.geometryCullingProceduresIndex[geometryPaletteId]
      ];

    const nodes = GeometryLUT.compiledGeometry[geometryPaletteId];

    for (const node of nodes) {
      if (node.type == "custom") {
        const nodeClass = VoxelModelConstructorRegister.getCustomNode(node.id);
        const newNode = new nodeClass(geometryPaletteId, this, node);
        newNode.init();
        this.nodes.push(newNode);
      }
      if (node.type == "quad") {
        const newNode = new QuadVoxelGometryNode(geometryPaletteId, this, node);
        newNode.init();
        this.nodes.push(newNode);
      }
      if (node.type == "triangle") {
        const newNode = new TriangleVoxelGeometryNode(
          geometryPaletteId,
          this,
          node
        );
        newNode.init();
        this.nodes.push(newNode);
      }
    }
  }
}
