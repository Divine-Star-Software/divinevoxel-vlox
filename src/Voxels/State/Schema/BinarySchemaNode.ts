import { StringPalette } from "../../../Util/StringPalette";
import { VoxelBinaryStateSchemaNode } from "../State.types";

export class BinarySchemaNode {
  get name() {
    return this.data.name
  }
  valuePalette?: StringPalette;
  bitIndex = 0;
  bitMask = 0;
  constructor(public readonly data: VoxelBinaryStateSchemaNode) {
    this.bitIndex = data.bitIndex;
    this.bitMask = (1 << data.bitSize) - 1;
    if (data.values) this.valuePalette = new StringPalette(data.values);
  }

  getValue(data: number) {
    return (data & (this.bitMask << this.bitIndex)) >> this.bitIndex;
  }

  setValue(data: number, value: number) {
    return (
      (data & ~(this.bitMask << this.bitIndex)) |
      ((value & this.bitMask) << this.bitIndex)
    );
  }
}
