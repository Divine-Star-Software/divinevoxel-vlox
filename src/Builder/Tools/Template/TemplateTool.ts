import { BuilderToolBase, ToolOptionsData } from "../BuilderToolBase";
import { VoxelBoundsSelection } from "../../../Templates/Selection/VoxelBoundsSelection";
import { FreeBoxSelection } from "../../Util/FreeBoxSelection";
import { FullVoxelTemplate } from "../../../Templates/Full/FullVoxelTemplate";
import { VoxelPointSelection } from "../../../Templates/Selection/VoxelPointSelection";
import { FreePointSelection } from "../../Util/FreePointSelection";
export enum TemplateToolModes {
  Select = "Select",
  Place = "Place",
  Remove = "Remove",
}
interface TemplateToolEvents {
  "selection-created": VoxelBoundsSelection;
}
export class TemplateTool extends BuilderToolBase<TemplateToolEvents> {
  static ToolId = "Template";
  static ModeArray: TemplateToolModes[] = [
    TemplateToolModes.Select,
    TemplateToolModes.Place,
    TemplateToolModes.Remove,
  ];
  mode = TemplateToolModes.Select;
  selection = new VoxelPointSelection();
  pointSelection = new FreePointSelection(this.space, this.selection);

  boxSelection: FreeBoxSelection | null = null;
  usePlacingStrategy = true;

  get distance() {
    return this.pointSelection.distance;
  }

  set distance(distance: number) {
    if (this.boxSelection) this.pointSelection.distance = distance;
  }

  private _started = false;

  async selectionToTemplate(
    selection: VoxelBoundsSelection
  ): Promise<FullVoxelTemplate> {
    const bounds = selection.bounds.getMinMax();
    return await this.space.createTemplate(bounds);
  }

  isSelectionStarted() {
    return this._started;
  }

  async update(placerMode: "start" | "end" | null = null) {
    if (this.boxSelection) {
      this.boxSelection.update();
    } else {
      this.pointSelection.update();
    }

    if (placerMode == "start") {
      this._started = true;
      this.boxSelection = new FreeBoxSelection(this.space, this.pointSelection);
    }

    if (placerMode == "end") {
      this._started = false;
      this.boxSelection = null;
    }
  }

  async use() {
    if (!this.boxSelection) return;
    if (this.mode == TemplateToolModes.Select) {
      this.dispatch("selection-created", this.boxSelection.selection);
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
