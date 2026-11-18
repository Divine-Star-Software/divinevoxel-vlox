import { SameVoxelRelationsConditionData } from "../../State.types";
import { ShapeStateSchemaRelationsCondition } from "./ShapeStateSchemaRelationsCondition";
import { RelationalStateBuilder } from "../RelationalStateBuilder";

export class SameVoxelCondition extends ShapeStateSchemaRelationsCondition {
  constructor(
    builder: RelationalStateBuilder,
    public data: SameVoxelRelationsConditionData
  ) {
    super(builder);
  }

  evaluate(): boolean {
    const nx = this.builder.position.x + this.data.direction[0];
    const ny = this.builder.position.y + this.data.direction[1];
    const nz = this.builder.position.z + this.data.direction[2];
    if (!this.builder.dataCursor.inBounds(nx, ny, nz)) return false;
    const nVoxel = this.builder.dataCursor.getVoxel(nx, ny, nz);
    if (!nVoxel) return false;
    return this.builder.voxel.isSameVoxel(nVoxel);
  }
}
