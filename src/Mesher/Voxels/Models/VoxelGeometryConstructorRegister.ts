import { GeoemtryNodeConstructor } from "./Nodes/GeometryNode";
import { VoxelGeometryConstructor } from "./Nodes/VoxelGeometryConstructor";
import { GeometryLUT } from "../../../Voxels/Data/GeometryLUT";

export class VoxelGeometryConstructorRegister {
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

  static init() {
    for (let i = 0; i < GeometryLUT.compiledGeometry.length; i++) {
      this.geometry[i] = new VoxelGeometryConstructor(i);
    }
  }
}
