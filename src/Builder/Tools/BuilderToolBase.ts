import { TypedEventTarget } from "../../Util/TypedEventTarget";

export abstract class BuilderToolBase<
  Events extends Record<string, any>
> extends TypedEventTarget<Events> {}
