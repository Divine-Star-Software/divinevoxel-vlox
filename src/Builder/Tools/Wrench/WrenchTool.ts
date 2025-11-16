import { VoxelPickResult } from "../../../Voxels/Interaction/VoxelPickResult";
import { VoxelBuildSpace } from "../../VoxelBuildSpace";
import { PaintVoxelData, RawVoxelData } from "../../../Voxels";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
import { SchemaRegister } from "../../../Voxels/State/SchemaRegister";
import { VoxelBinaryStateSchemaNode } from "../../../Voxels/State/State.types";
import { VoxelPalettesRegister } from "../../../Voxels/Data/VoxelPalettesRegister";
import { BinarySchema } from "Voxels/State/Schema/BinarySchema";
enum WrenchToolModes {
  Pick = "Pick",
  Update = "Update",
}
interface WrenchToolEvents {
  picked: {};
}

export type WrenchToolVoxelScehmaNodes =
  | {
      type: "string";
      values: string[];
      id: string;
      label: string;
      value: string;
    }
  | {
      type: "number";
      min: number;
      max: number;
      id: string;
      label: string;
      value: number;
    };

type WrenchToolSchemas = {
  stateSchema: WrenchToolVoxelScehmaNodes[];
  modSchema: WrenchToolVoxelScehmaNodes[];
};

export class WrenchTool extends BuilderToolBase<WrenchToolEvents> {
  static ToolId = "Wrench";
  private mode = WrenchToolModes.Pick;
  selection = new VoxelPointSelection();
  paintData = PaintVoxelData.Create();
  private _pickedResult: VoxelPickResult | null = null;

  isUpdating() {
    if (this._pickedResult !== null && this.mode == WrenchToolModes.Update)
      return true;
    return false;
  }

  stopUpdating() {
    this.mode = WrenchToolModes.Pick;
    this._pickedResult = null;
  }

  async update() {
    this._lastPicked = await this.space.pickWithProvider(this.rayProviderIndex);
    if (!this._lastPicked) return;
    if (this.mode == WrenchToolModes.Pick) {
      if (!this.space.bounds.intersectsPoint(this._lastPicked.position)) {
        this._lastPicked = null;
        return;
      }
      this.selection.reConstruct(this._lastPicked.position);
    }
  }

  private processSchema(schema: BinarySchema): WrenchToolVoxelScehmaNodes[] {
    const nodes: WrenchToolVoxelScehmaNodes[] = [];
    for (const node of schema.nodes) {
      if (node.valuePalette) {
        nodes.push({
          id: node.name,
          label: node.name,
          values: [...node.valuePalette._palette],
          type: "string",
          value: "",
        });
      } else {
        nodes.push({
          id: node.name,
          label: node.name,
          min: 0,
          max: Math.pow(2, node.data.bitSize) - 1,
          type: "number",
          value: 0,
        });
      }
    }
    return nodes;
  }

  updatePickedSchema(schema: WrenchToolSchemas) {
    if (!this._pickedResult) return;
    const trueVoxelId = this._pickedResult.voxel.getVoxelId();

    const voxelSchemas = SchemaRegister.getVoxelSchemas(
      this._pickedResult.voxel.getStringId()
    );
    voxelSchemas.state.startEncoding(this._pickedResult.voxel.getState());
    voxelSchemas.mod.startEncoding(this._pickedResult.voxel.getMod());

    for (const node of schema.stateSchema) {
      if (node.type == "string") {
        voxelSchemas.state.setValue(node.id, node.value);
      } else {
        voxelSchemas.state.setNumber(node.id, node.value);
      }
    }
    for (const node of schema.modSchema) {
      if (node.type == "string") {
        voxelSchemas.mod.setValue(node.id, node.value);
      } else {
        voxelSchemas.mod.setNumber(node.id, node.value);
      }
    }

    const currentRaw = this._pickedResult.voxel.getRaw();
    const rawVoxelData: RawVoxelData = [
      VoxelPalettesRegister.getVoxelId(
        trueVoxelId,
        voxelSchemas.state.getEncoded(),
        voxelSchemas.mod.getEncoded()
      ),
      currentRaw[1],
      currentRaw[2],
      currentRaw[3],
    ];
    this.paintData = PaintVoxelData.FromRaw(rawVoxelData);
    return this.paintData;
  }

  getPickedSchema(): WrenchToolSchemas | null {
    if (!this._pickedResult) return null;
    const id = this._pickedResult.voxel.getStringId();

    const voxelSchemas = SchemaRegister.getVoxelSchemas(id);
    voxelSchemas.state.startEncoding(this._pickedResult.voxel.getState());
    voxelSchemas.mod.startEncoding(this._pickedResult.voxel.getMod());
    return {
      stateSchema: this.processSchema(voxelSchemas.state),
      modSchema: this.processSchema(voxelSchemas.mod),
    };
  }

  /**Get an array of all possible state varations for the current mod of the selected voxel. */
  getStateValues(): PaintVoxelData[] | null {
    if (!this._pickedResult) return null;
    const voxelStates: PaintVoxelData[] = [];
    const voxelId = this._pickedResult.voxel.id;
    const [trueId, , mod] = VoxelPalettesRegister.voxels[voxelId];

    const stateArray = VoxelPalettesRegister.voxelRecord[trueId][mod];
    const rawVoxelData: RawVoxelData = [0, 0, 0, 0];
    for (let i = 0; i < stateArray.length; i++) {
      const value = stateArray[i];

      if (value === undefined || value <= 0) continue;
      rawVoxelData[0] = value;
      voxelStates.push(PaintVoxelData.FromRaw(rawVoxelData));
    }
    return voxelStates;
  }

  /**Get an array of all possible mod varations for the current state of the selected voxel. */
  getModValues(): PaintVoxelData[] | null {
    if (!this._pickedResult) return null;
    const voxelStates: PaintVoxelData[] = [];
    const voxelId = this._pickedResult.voxel.id;
    const [trueId, state] = VoxelPalettesRegister.voxels[voxelId];
    const modArray = VoxelPalettesRegister.voxelRecord[trueId];
    const rawVoxelData: RawVoxelData = [0, 0, 0, 0];
    for (let i = 0; i < modArray.length; i++) {
      const stateArray = modArray[i];
      if (stateArray === undefined || !stateArray.length) continue;
      let id = -1;
      for (let j = 0; j < stateArray.length; j++) {
        id = VoxelPalettesRegister.voxelRecord[trueId][i][state];
        if (id === undefined || id < 0) continue;
        rawVoxelData[0] = id;
        break;
      }
      if (id === undefined || id < 0) continue;
      voxelStates.push(PaintVoxelData.FromRaw(rawVoxelData));
    }
    return voxelStates;
  }

  cancel(): void {
    this._lastPicked = null;
  }

  async use() {
    if (this.mode == WrenchToolModes.Pick) {
      if (this._lastPicked && !this._lastPicked.voxel.isAir()) {
        this._pickedResult = this._lastPicked.clone();
        this.dispatch("picked", {});
        this.mode = WrenchToolModes.Update;
        return;
      } else {
        this._pickedResult = null;
      }
    }
    if (this.mode == WrenchToolModes.Update) {
      await this.space.paintVoxel(
        [
          this.selection.origin.x,
          this.selection.origin.y,
          this.selection.origin.z,
        ],
        this.paintData
      );
      return;
    }
  }

  getOptionValue(id: string) {
    return null;
  }

  getCurrentOptions(): ToolOptionsData {
    return [];
  }
  updateOption(property: string, value: any): void {}
}
