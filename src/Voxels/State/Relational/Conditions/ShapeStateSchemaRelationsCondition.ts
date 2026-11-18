import { ReltionalStateBuilder } from "../ReltionalStateBuilder";

export abstract class ShapeStateSchemaRelationsCondition {
  constructor(public builder: ReltionalStateBuilder) {}

  abstract evulate(): boolean;
}
