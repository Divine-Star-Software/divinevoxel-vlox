import { RenderedMaterials } from "./Voxels/Models/RenderedMaterials";
import { VoxelModelConstructorRegister } from "./Voxels/Models/VoxelModelConstructorRegister.js";
import { LiquidGeometryNode } from "./Voxels/Models/Nodes/Custom/Liquid/LiquidGeometryNode.js";
import { VoxelConstructor } from "./Voxels/Models/VoxelConstructor.js";
import { VoxelLUT } from "../Voxels/Data/VoxelLUT";

export default function () {
  RenderedMaterials.register(VoxelLUT.material._palette);

  VoxelModelConstructorRegister.registerCustomNode(
    "liquid",
    LiquidGeometryNode
  );

  VoxelModelConstructorRegister.init();
  for (const voxel of VoxelLUT.voxelIds._palette) {
    VoxelModelConstructorRegister.registerVoxel(
      new VoxelConstructor(
        voxel,
        RenderedMaterials.meshersMap.get(
          VoxelLUT.material.getStringId(
            VoxelLUT.materialMap[VoxelLUT.voxelIds.getNumberId(voxel)]
          )
        )!
      )
    );
  }
}
