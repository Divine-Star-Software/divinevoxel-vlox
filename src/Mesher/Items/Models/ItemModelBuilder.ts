import { ProtoMesh } from "../../Geomtry/Proto/ProtoMesh";
import { Vec3Array, Vector3Like, Vector4Like } from "@amodx/math";
import { ItemMeshVertexStructCursor } from "../Geomtry/ItemMeshVertexStructCursor";

class ItemVars {
  textureIndex = 0;

  reset() {
    this.textureIndex = 0;
  }
}

export class ItemModelBuilder {
  /**The current world position */
  position = Vector3Like.Create();
  /**The current local origin  */
  origin = Vector3Like.Create();

  mesh = new ProtoMesh(ItemMeshVertexStructCursor.VertexFloatSize);

  vars = new ItemVars();

  bounds: { min: Vec3Array; max: Vec3Array } = {
    min: [0, 0, 0],
    max: [0, 0, 0],
  };
  _indexStart = 0;

  constructor(public id: string) {}

  startConstruction() {
    this._indexStart = this.mesh!.indicieCount;
    this.bounds.min[0] = Infinity;
    this.bounds.min[1] = Infinity;
    this.bounds.min[2] = Infinity;
    this.bounds.max[0] = -Infinity;
    this.bounds.max[1] = -Infinity;
    this.bounds.max[2] = -Infinity;
    this._boundsUpdate = false;
  }

  endConstruction() {
    this.vars.reset();
    return true;
  }

  _boundsUpdate = false;
  updateBounds(bounds: [Vec3Array, Vec3Array]) {
    const origin = this.origin;
    //min
    if (origin.x + bounds[0][0] < this.bounds.min[0])
      this.bounds.min[0] = origin.x + bounds[0][0];
    if (origin.y + bounds[0][1] < this.bounds.min[1])
      this.bounds.min[1] = origin.y + bounds[0][1];
    if (origin.z + bounds[0][2] < this.bounds.min[2])
      this.bounds.min[2] = origin.z + bounds[0][2];
    //max
    if (origin.x + bounds[1][0] > this.bounds.max[0])
      this.bounds.max[0] = origin.x + bounds[1][0];
    if (origin.y + bounds[1][1] > this.bounds.max[1])
      this.bounds.max[1] = origin.y + bounds[1][1];
    if (origin.z + bounds[1][2] > this.bounds.max[2])
      this.bounds.max[2] = origin.z + bounds[1][2];

    this._boundsUpdate = true;
  }

  clear() {
    this.vars.reset();
    this.mesh.clear();
    return this;
  }
}
