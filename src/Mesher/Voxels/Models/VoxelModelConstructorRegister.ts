import { GeoemtryNodeConstructor } from "./Nodes/GeometryNode";
import { VoxelConstructor } from "./VoxelConstructor";
import { VoxelGeometryConstructor } from "./Nodes/VoxelGeometryConstructor";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { GeometryLUT } from "../../../Voxels/Data/GeometryLUT";

export class VoxelModelConstructorRegister {
  static geometry: VoxelGeometryConstructor[] = [];
  static customNodes = new Map<string, GeoemtryNodeConstructor<any, any>>();
  static registerCustomNode(
    id: string,
    node: GeoemtryNodeConstructor<any, any>
  ) {
    this.customNodes.set(id, node);
  }
  static getCustomNode(id: string) {
    const node = this.customNodes.get(id);
    if (!node) throw new Error(`Custom geometry node [${id}] does not exist.`);
    return node;
  }

  static constructorsPaltte: VoxelConstructor[] = [];
  static constructors = new Map<string, VoxelConstructor>();
  static getConstructor(id: string): VoxelConstructor {
    return <VoxelConstructor>this.constructors.get(id);
  }
  static registerVoxel(voxel: VoxelConstructor | VoxelConstructor[]) {
    if (Array.isArray(voxel)) {
      for (const vox of voxel) {
        this.constructors.set(vox.id, vox);
        this.constructorsPaltte[
          VoxelLUT.voxelIds.getNumberId(vox.id)
        ] = vox;
      }
      return;
    }
    this.constructorsPaltte[
      VoxelLUT.voxelIds.getNumberId(voxel.id)
    ] = voxel;
    this.constructors.set(voxel.id, voxel);
  }

  static init() {
    for (let i = 0; i < GeometryLUT.compiledGeometry.length; i++) {
      this.geometry[i] = new VoxelGeometryConstructor(i);
    }
  }
}
