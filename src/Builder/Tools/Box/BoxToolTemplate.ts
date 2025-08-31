import { FullVoxelTemplate } from "../../../Templates/Full/FullVoxelTemplate";
import { VoxelBoxSelection } from "../../../Templates/Selection/VoxelBoxSelection";
import { VoxelBuildSpace } from "../../VoxelBuildSpace";

export class BoxToolTemplate {
  template: FullVoxelTemplate;
  private _created = false;
  constructor(
    public space: VoxelBuildSpace,
    public selection: VoxelBoxSelection
  ) {}

  async create() {
    if (this._created) return;
    const bounds = this.selection.bounds.getMinMax();
    this.template = await this.space.createTemplate(bounds);
    this._created = true;
  }

  async place() {
    await this.space.paintTemplate(
      this.selection.origin,
      this.template.toJSON()
    );
  }

  async clear() {
    await this.space.eraseTemplate(
      this.selection.origin,
      this.template.toJSON()
    );
  }
}
