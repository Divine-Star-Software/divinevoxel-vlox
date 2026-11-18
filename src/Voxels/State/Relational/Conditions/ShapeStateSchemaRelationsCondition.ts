import { RelationalStateBuilder } from "../RelationalStateBuilder";

export abstract class ShapeStateSchemaRelationsCondition {
  constructor(public builder: RelationalStateBuilder) {}

  abstract evaluate(): boolean;
}
