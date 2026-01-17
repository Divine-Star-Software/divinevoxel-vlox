import { RenderedMaterials } from "./Voxels/Models/RenderedMaterials";
import { VoxelGeometryConstructorRegister } from "./Voxels/Models/VoxelGeometryConstructorRegister.js";
import { LiquidGeometryNode } from "./Voxels/Models/Nodes/Custom/Liquid/LiquidGeometryNode.js";

export default function () {
  RenderedMaterials.init();

  VoxelGeometryConstructorRegister.registerCustomNode(
    "liquid",
    LiquidGeometryNode
  );

  VoxelGeometryConstructorRegister.init();
}
