import { Vector3Like } from "@amodx/math";
import { VoxelModelRelationsSchemaNodes } from "../State.types";
import { SameVoxelCondition } from "./Conditions/SameVoxelConditions";
import { ShapeStateSchemaRelationsCondition } from "./Conditions/ShapeStateSchemaRelationsCondition";
import { VoxelCursorInterface } from "../../Cursor/VoxelCursor.interface";
import { DataCursorInterface } from "../../Cursor/DataCursor.interface";
import { BinarySchema } from "../Schema/BinarySchema";

export class ReltionalStateBuilder {
  name: string;
  position = Vector3Like.Create();
  voxel: VoxelCursorInterface;
  dataCursor: DataCursorInterface;

  nodes = new Map<string, ShapeStateSchemaRelationsCondition[]>();
  constructor(
    public binarySchema: BinarySchema,
    public readonly schemaNodes: VoxelModelRelationsSchemaNodes[]
  ) {
    for (const node of schemaNodes) {
      const conditions: ShapeStateSchemaRelationsCondition[] = [];
      for (const cond of node.conditions) {
        if (cond.type == "same-voxel") {
          conditions.push(new SameVoxelCondition(this, cond));
        }
      }
      this.nodes.set(node.name, conditions);
    }
  }

  buildState() {
    this.binarySchema.startEncoding(0);
    for (const [nodeId, conditions] of this.nodes) {
      let value = 1;
      const conditionsLength = conditions.length;
      for (let i = 0; i < conditionsLength; i++) {
        if (!conditions[i].evulate()) {
          value = 0;
          break;
        }
      }
      this.binarySchema.setNumber(nodeId, value);
    }

    return this.binarySchema.getEncoded();
  }

  getSchema() {
    return this.schemaNodes;
  }
}
